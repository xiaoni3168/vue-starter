import D3G from './d3G';
import D3Circle from './d3Circle';
import D3Line from './d3Line';
import D3Rect from './d3Rect';
import D3Path from './d3Path';
import D3Shape from './d3Shape';

import CloseComponent from './CloseComponent';

export default class CombineComponent extends D3Shape {
    constructor (container, config) {
        super(container, config);
        this.container = container;
        this.config = config;

        this.container.map = this.container.map ? this.container.map : {};

        this.g = new D3G(this.container, this.config.d3G || {})
        this.gContext = this.g.draw();
    }

    draw () {
        let gCircle = new D3G(this.gContext, {}).draw();
        let close = new CloseComponent(gCircle, {
            cx: this.config.d3Circle.cx + 30,
            cy: this.config.d3Circle.cy - 30,
            r: 10,
            fill: '#333333',
            onClick: () => {
                this.destroy();
            }
        }).draw();
        this.container
            .on('click', () => {
                window.Dispatch.call('bus', this);
                this.config.onClick ? this.config.onClick.call(this) : void 0;
            });
            
        let circle = new D3Circle(gCircle, Object.assign({}, this.config.d3Circle, {
            onClick: () => {
                !close.status && close.showClose();
            }
        }));
        
        let context = [];
        this.config.d3Rect.forEach(rect => {
            let uuid = this.generateUUID();
            let gRect = new D3G(this.gContext, {}).draw();
            let rectContext = new D3Rect(gRect, Object.assign({}, rect, {
                name: uuid
            }));

            this.container.map[uuid] = rectContext;

            window.Dispatch.on(`bus.${uuid}`, state => {
                
            });

            rectContext.plugins = [
                new D3Rect(gRect, {
                    name: 'LeftPlugin',
                    x: rect.x + rect.width - 5,
                    y: rect.y + rect.height / 2 - 5,
                    boundary: rect.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x + rect.width / 2 - 5, uEvent.y - 5];
                    }
                }),
                new D3Rect(gRect, {
                    name: 'RightPlugin',
                    x: rect.x - 5,
                    y: rect.y + rect.height / 2 - 5,
                    boundary: rect.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x - rect.width / 2 - 5, uEvent.y - 5];
                    }
                }),
                new D3Rect(gRect, {
                    name: 'TopPlugin',
                    x: rect.x + rect.width / 2 - 5,
                    boundary: rect.boundary,
                    y: rect.y - 5,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x - 5, uEvent.y - rect.height / 2 - 5];
                    }
                }),
                new D3Rect(gRect, {
                    name: 'BootomPlugin',
                    x: rect.x + rect.width / 2 - 5,
                    y: rect.y + rect.height - 5,
                    boundary: rect.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x - 5, uEvent.y + rect.height / 2 - 5];
                    }
                })
            ];
            context.push(rectContext);
        });

        this.drawLine(context, circle, this.gContext);

        circle.draw();

        context.forEach(rect => {
            rect.draw();
            rect.plugins.forEach(plugin => {
                plugin.draw().style('opacity', 0);
            });
        });
    }

    drawLine (shapes, core, container) {
        shapes.forEach((shape, $i) => {
            let hooks = shape.config.hooks;

            hooks.forEach(hook => {
                switch (hook.position) {
                    case 'top':
                        hook.point = [shape.config.x + shape.config.width / 2, shape.config.y];break;
                    case 'bottom':
                        hook.point = [shape.config.x + shape.config.width / 2, shape.config.y + shape.config.height];break;
                    case 'left':
                        hook.point = [shape.config.x, shape.config.y + shape.config.height / 2];break;
                    case 'right':
                        hook.point = [shape.config.x + shape.config.width, shape.config.y + shape.config.height / 2];break;
                    default:
                        break;
                }

                let line = new D3Line(container, {
                    x1: hook.type === 'out' ? hook.point[0] : core.config.hooks[$i].point[0],
                    y1: hook.type === 'out' ? hook.point[1] : core.config.hooks[$i].point[1],
                    x2: hook.type !== 'out' ? hook.point[0] : core.config.hooks[$i].point[0],
                    y2: hook.type !== 'out' ? hook.point[1] : core.config.hooks[$i].point[1],
                    stroke: '#333333',
                    strokeWidth: 1
                });
                
                line.setIn(hook.type === 'out' ? hook : core.config.hooks[$i]);
                line.setOut(hook.type !== 'out' ? hook : core.config.hooks[$i]);

                core.config.hooks[$i].connector = line;
                hook.connector = line;

                line.draw();
            });
        });
    }

    destroy () {
        this.gContext.remove();
    }

    generateUUID () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    };
}