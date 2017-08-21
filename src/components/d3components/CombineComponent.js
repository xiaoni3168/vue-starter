import Vue from 'vue';

import D3G from './d3G';
import D3Circle from './d3Circle';
import D3Line from './d3Line';
import D3Rect from './d3Rect';
import D3Path from './d3Path';
import D3Shape from './d3Shape';

import CloseComponent from './CloseComponent';

import { EventBus } from '../../event.bus';

export default class CombineComponent extends D3Shape {
    constructor (container, config) {
        super(container, config);
        this.container = container;
        this.config = config;

        this.container.map = this.container.map ? this.container.map : {};

        this.activatedContextUUID;

        this.g = new D3G(this.container, this.config.d3G || {})
        this.gContext = this.g.draw();

        this.container.connectLine = [null];
    }

    draw () {
        const _this = this;
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
                if (this.activatedContextUUID) {
                    EventBus.$emit('clearPlugin');
                }
                this.config.onClick ? this.config.onClick.call(this) : void 0;
            });
            
        let circle = new D3Circle(gCircle, Object.assign({}, this.config.d3Circle, {
            onClick: () => {
                !close.$context.status && close.$context.showClose();
            }
        }));

        circle.plugins = close;
        
        let context = [];
        this.config.d3Rect.forEach(rect => {
            let uuid = this.generateUUID();
            let gRect = new D3G(this.gContext, {}).draw();
            let rectContext = new D3Rect(gRect, Object.assign({}, rect, {
                name: uuid
            }));

            this.container.map[uuid] = rectContext;

            rectContext.plugins = [
                new D3Rect(gRect, {
                    name: 'right',
                    type: 'plugin',
                    x: rect.x + rect.width - 5,
                    y: rect.y + rect.height / 2 - 5,
                    boundary: rect.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x + rect.width / 2 - 5, uEvent.y - 5];
                    },
                    onDragStart: function () {
                        _this.container.connectLine[_this.container.connectLine.length - 1] = new D3Line(_this.gContext, {
                            x1: this.position[0] + 5,
                            y1: this.position[1] + 5,
                            x2: this.position[0] + 5,
                            y2: this.position[1] + 5,
                            stroke: '#333333',
                            strokeWidth: 1,
                            height: _this.config.arrow
                        });
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        let hook = {
                            $parent: this.$parent,
                            connected: true,
                            connector: connectLine,
                            point: this.position,
                            position: 'right',
                            type: 'out',
                            updater: (config, uEvent) => {
                                return [uEvent.x + config.width / 2, uEvent.y];
                            }
                        }
                        connectLine.setIn(hook);
                    },
                    onDrag: () => {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        connectLine.updateConfig({
                            x2: window.d3.event.x,
                            y2: window.d3.event.y
                        });
                        connectLine.draw();
                    },
                    onDragEnd: function () {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        if (!connectLine.out || connectLine.notActive) {
                            connectLine.destroy();
                        } else {
                            connectLine.in.$parent.hooks.push(connectLine.in);
                            connectLine.out.$parent.hooks.push(connectLine.out);
                            _this.container.connectLine.push(null);
                        }
                    }
                }),
                new D3Rect(gRect, {
                    name: 'left',
                    type: 'plugin',
                    x: rect.x - 5,
                    y: rect.y + rect.height / 2 - 5,
                    boundary: rect.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    style: 'z-index: 100',
                    updater: (uEvent, config) => {
                        return [uEvent.x - rect.width / 2 - 5, uEvent.y - 5];
                    },
                    onMouseOver: function () {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        if (connectLine) {
                            let hook = {
                                $parent: this.$parent,
                                connected: true,
                                connector: connectLine,
                                point: this.position,
                                position: this.config.name,
                                type: 'in',
                                updater: (config, uEvent) => {
                                    return [uEvent.x - config.width / 2, uEvent.y];
                                }
                            };
                            connectLine.setOut(hook);
                        }
                    },
                    onMouseLeave: function () {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        if (connectLine) {
                            _this.container.connectLine[_this.container.connectLine.length - 1].notActive = true;
                        }
                    }
                }),
                new D3Rect(gRect, {
                    name: 'top',
                    type: 'plugin',
                    x: rect.x + rect.width / 2 - 5,
                    boundary: rect.boundary,
                    y: rect.y - 5,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x - 5, uEvent.y - rect.height / 2 - 5];
                    },
                    onMouseOver: function () {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        if (connectLine) {
                            let hook = {
                                $parent: this.$parent,
                                connected: true,
                                connector: connectLine,
                                point: this.position,
                                position: this.config.name,
                                type: 'in',
                                updater: (config, uEvent) => {
                                    return [uEvent.x, uEvent.y - config.height / 2];
                                }
                            };
                            connectLine.setOut(hook);
                        }
                    },
                    onMouseLeave: function () {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        if (connectLine) {
                            _this.container.connectLine[_this.container.connectLine.length - 1].notActive = true;
                        }
                    }
                }),
                new D3Rect(gRect, {
                    name: 'bottom',
                    type: 'plugin',
                    x: rect.x + rect.width / 2 - 5,
                    y: rect.y + rect.height - 5,
                    boundary: rect.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x - 5, uEvent.y + rect.height / 2 - 5];
                    },
                    onDragStart: function () {
                        _this.container.connectLine[_this.container.connectLine.length - 1] = new D3Line(_this.gContext, {
                            x1: this.position[0] + 5,
                            y1: this.position[1] + 5,
                            x2: this.position[0] + 5,
                            y2: this.position[1] + 5,
                            stroke: '#333333',
                            strokeWidth: 1,
                            height: _this.config.arrow
                        });
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        let hook = {
                            $parent: this.$parent,
                            connected: true,
                            connector: connectLine,
                            point: this.position,
                            position: 'bottom',
                            type: 'out',
                            updater: (config, uEvent) => {
                                return [uEvent.x, uEvent.y + config.height / 2];
                            }
                        }
                        connectLine.setIn(hook);
                    },
                    onDrag: () => {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        connectLine.updateConfig({
                            x2: window.d3.event.x,
                            y2: window.d3.event.y
                        });
                        connectLine.draw();
                    },
                    onDragEnd: function () {
                        let connectLine = _this.container.connectLine[_this.container.connectLine.length - 1];
                        if (!connectLine.out || connectLine.notActive) {
                            connectLine.destroy();
                        } else {
                            connectLine.in.$parent.hooks.push(connectLine.in);
                            connectLine.out.$parent.hooks.push(connectLine.out);
                            _this.container.connectLine.push(null);
                        }
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
                plugin.$parent = rect;
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
                    strokeWidth: 1,
                    height: this.config.arrow
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