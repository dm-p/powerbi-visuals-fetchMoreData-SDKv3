/*
 *  Power BI Custom Visuals SDK - Bare-Minimum fetchMoreData Implementation
 *
 *  Copyright (c) Daniel Marsh-Patrick
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the 'Software'), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
'use strict';

/** Power BI API Dependencies */
    import 'core-js/stable';
    import './../style/visual.less';
    import powerbi from 'powerbi-visuals-api';
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataView = powerbi.DataView;
    import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
    import VisualDataChangeOperationKind = powerbi.VisualDataChangeOperationKind;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;

/** Internal Dependencies */
    import { VisualSettings } from './settings';

    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;
        private host: IVisualHost;
        private windowsLoaded: number;

        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.target = options.element;
            this.updateCount = 0;
            this.host = options.host;
            if (typeof document !== 'undefined') {
                const new_p: HTMLElement = document.createElement('p');
                new_p.appendChild(document.createTextNode('Message:'));
                const new_em: HTMLElement = document.createElement('em');
                this.textNode = document.createTextNode(this.updateCount.toString());
                new_em.appendChild(this.textNode);
                new_p.appendChild(new_em);
                this.target.appendChild(new_p);
            }
        }

        public update(options: VisualUpdateOptions) {

            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            console.log('Visual update', options, this.settings);
            console.log('Update kind', options.operationKind);
            if (options.operationKind === VisualDataChangeOperationKind.Create) {
                this.windowsLoaded = 1;
            } else {
                this.windowsLoaded++;
            }

            let rowCount = options.dataViews[0].table.rows.length;

            if (        options.dataViews[0].metadata.segment
            ) {
                this.textNode.textContent = `Loading more data. ${rowCount} rows loaded so far (over ${this.windowsLoaded} fetches)...`;
                let canFetchMore = this.host.fetchMoreData();
                if (!canFetchMore) {
                    this.textNode.textContent = `Memory limit hit after ${this.windowsLoaded} fetches. We managed to get ${rowCount} rows.`;
                }
            } else {
                this.textNode.textContent = `We have all the data we can get (${rowCount} rows over ${this.windowsLoaded} fetches)!`;
            }

        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /**
         * This function gets called for each of the objects defined in the `capabilities.json` file and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }