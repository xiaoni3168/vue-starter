/**
 * ETL流程图绘制工具
 *
 * 该方法在项目初始化的时候写入plugin
 * 可通过 this.D3Diagram 访问
 *
 * TODO: 连线的拐角以及拐角处圆弧的计算
 */
export default class D3Diagram {
    constructor ($d3) {
        this.$d3                = $d3;      // d3
        this.instance           = null;     // 工具实例(单例)
        /** 画布事件存储变量 */
        this.onMouseDownFuncs   = [];       // 存储所有需要在画布上触发的 mousedown 事件栈
        this.onMouseUpFuncs     = [];       // 存储所有需要在画布上触发的 mouseup 事件栈
        this.onMouseMoveFunc    = [];       // 存储所有需要在画布上触发的 mousemove 事件栈
        /** 连线相关变量 */
        this.connecting         = false;    // 当前画布上是否有连线事件
        this.connector          = null;     // 当前画布上正在连接的线 (type: d3.selector)

        /** 画布绝对位置偏移量 */
        this.containerLeft      = 0;
        this.containerTop       = 0;

        this.selectD            = null;

        /** 注册事件 */
        this.dispatcher = this.$d3.dispatch('onload', 'rect_click', 'rect_move');
    }

    /**
     * 初始化画布
     * @param  {String} dom        初始化元素selector
     * @param  {Object} config     配置
     * @return {undefined}
     */
    init ({ dom, config = {} }) {
        const _this = this;

        /** 初始化获取画布的绝对位置偏移量 */
        this.containerLeft = this.$d3.select(dom).node().offsetLeft;

        this.containerResize(dom);

        /** 初始化工具实例 */
        this.instance = this.$d3.select(dom).append('svg').attr('tabindex', -1).style('transform', `translate(${-this.containerLeft}px, 0px)`);

        /** 画布的拖拽 */
        this.dragCanvas();

        /** 设置画布 */
        for (let [key, value] of Object.entries(config)) {
            this.instance.attr(key, value);
        }

        /** 画布 MouseEvent 注册 */
        this.instance
            .on('mousedown', function () {
                _this.onMouseDownFuncs.forEach(func => {
                    func.call(this);
                });
            })
            .on('mouseup', function () {
                _this.onMouseUpFuncs.forEach(func => {
                    func.call(this);
                });
            })
            .on('mousemove', function () {
                _this.onMouseMoveFunc.forEach(func => {
                    func.call(this);
                });
            });

        this.dispatcher.call('onload', this, true);
    }

    /**
     * 获取当前画布的实例instance
     * @return {instance}
     */
    getInstance () {
        return this.instance;
    }

    /**
     * 添加新的画布 mousedown 事件到画布 MouseEvent 的调用栈中
     * @param {Function} func mousedown事件
     */
    setMouseDownFuncs (func) {
        this.onMouseDownFuncs.push(func);
    }

    /**
     * 添加新的画布 mouseup 事件到画布 MouseEvent 的调用栈中
     * @param {Function} func mouseup事件
     */
    setMouseUpFuncs (func) {
        this.onMouseUpFuncs.push(func);
    }

    /**
     * 添加新的画布 mousemove 事件到画布 MouseEvent 的调用栈中
     * @param {Function} func mousemove事件
     */
    setMouseMoveFunc (func) {
        this.onMouseMoveFunc.push(func);
    }

    /**
     * 生成矩形
     * @param  {Array} config      配置
     * @param  {Object} func
     * @return {instance}
     */
    rect (configs = [], func = {}) {
        const _this = this;

        let vTime   = 0,    // 计算元素 mousedown 和 mouseup 事件的timeStamp差值，用来模拟 click 事件(vTime < 300ms)
            rectData;       // 画布上所有rect元素数据

        rectData = this.instance
            .selectAll('rect')
            .data(configs)
            .enter()
            .append('rect')
            /** rect元素绘制 */
            .attr('x',              d => d.x)
            .attr('y',              d => d.y)
            .attr('height',         d => d.height)
            .attr('width',          d => d.width)
            .attr('rx',             d => d.rx)
            .attr('ry',             d => d.ry)
            .attr('fill',           d => d.fill)
            .attr('stroke',         d => d.stroke)
            .attr('stroke-width',   d => d.strokeWidth)
            .attr('data-uid',       d => d.uid)
            /** rect元素连接点绘制 */
            .each(drawHook)
            /** rect元素icon绘制 */
            .each(drawIcon)
            /** rect元素上 mouseup 事件(用于：连线) */
            .on('mouseup', rectMouseUp)
            .on('mouseover', rectMouseOver)
            .on('mouseleave', rectMouseLeave)
            /** rect元素添加到画布的动画效果添加 */
            .classed('animated jelly', true)
            .attr('style',          d => {
                return `transform-origin: ${d.x + d.width / 2}px ${d.y + d.height / 2}px;-moz-transform-origin: ${d.x + d.width / 2}px ${d.y + d.height / 2}px;`;
            })

        /** rect元素拖拽事件 */
        rectData.call(
            this.$d3
                .drag()
                .on('start',    dragstarted)
                .on('drag',     draged)
                .on('end',      dragended)
            );

        /** -功能Function定义- */
        function drawHook (d) {
            /** 绘制input和output */
            _this.$d3.set(['dataset', 'operation'])
                .has(d.type) ? _this.instance  // output
                .append('circle')
                .attr('bind-uid', d.uid)
                .attr('cx', d.x + d.width)
                .attr('cy', d.y + d.height / 2)
                .attr('r', 4)
                .attr('fill', '#cccccc')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1)
                .classed('animated jelly', true)
                /** 连线开始 */
                .on('mousedown', function () {
                    _this.$d3.event.stopPropagation();

                    _this.connecting = true;
                    /** 创建鼠标连线 */
                    _this.connector = _this.instance.append('g').attr('input-uid', d.uid);
                    _this.connector
                        .selectAll('path.connector') // 此处加上.connector是为了让d3选择器选择一个空节点来填充数据
                        .data([{ x1: d.x + d.width + 4, y1: d.y + d.height / 2, x2: d.x + d.width + 4, y2: d.y + d.height / 2 }])
                        .enter()
                        .append('path')
                        .attr('d', function (_d) {
                            return `M ${_d.x1} ${_d.y1} L ${_d.x2} ${_d.y2}`;
                        })
                        .attr('fill', 'none')
                        .attr('stroke', '#5abeff')
                        .attr('stroke-width', 2)
                        .attr('input-uid', d.uid)
                        .style('pointer-events', 'none');
                    /** 添加rect元素上连线point的connecting样式(标记为连接状态) */
                    _this.$d3.select(this).classed('connecting', true);
                })
                .style('-moz-transform-origin', `${d.x + d.width / 2}px ${d.y + d.height / 2}px`)
                .style('transform-origin', `${d.x + d.width / 2}px ${d.y + d.height / 2}px`) : void 0;
            _this.$d3.set(['operation'])
                .has(d.type) ? _this.instance  // input
                .append('path')
                .attr('bind-uid', d.uid)
                .attr('d', `M ${d.x - 4} ${d.y + d.height / 2 - 6} L ${d.x + Math.sqrt(12 * 12 - 6 * 6) - 4} ${d.y + d.height / 2} L ${d.x - 4} ${d.y + d.height / 2 + 6} z`)
                .attr('fill', '#cccccc')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1)
                .classed('animated jelly', true)
                /** 连线终止 */
                .on('mouseup', function () {
                    if (_this.connecting) {
                        drawLineToCanvas(d);
                    }
                })
                .style('-moz-transform-origin', `${d.x + d.width / 2}px ${d.y + d.height / 2}px`)
                .style('transform-origin', `${d.x + d.width / 2}px ${d.y + d.height / 2}px`) : void 0;
            /** 将鼠标画线事件添加到画布 MouseEvent 的事件调用栈中 */
            _this.setMouseMoveFunc(drawLineMove);
            _this.setMouseUpFuncs(drawLineUp);
            /** 绘制关闭按钮 */
            _this.instance
                .append('use')
                .attr('bind-uid', d.uid)
                .attr('x', d.x + d.width - 12)
                .attr('y', d.y + 4)
                .attr('xlink:href', '#icon-close')
                .classed('icon-close', true)
                .style('display', 'none')
                .on('click', function () {
                    /** 点击关闭按钮时删除所有绑定当前uid的svg元素 */
                    _this.$d3.selectAll(`[bind-uid="${d.uid}"]`).each(function () {
                        _this.$d3.select(this).remove();
                    });
                    _this.$d3.selectAll(`[in-uid="${d.uid}"]`).each(function () {
                        _this.$d3.select(this).remove();
                    });
                    _this.$d3.selectAll(`[out-uid="${d.uid}"]`).each(function () {
                        _this.$d3.select(this).remove();
                    });
                    _this.$d3.select(`[data-uid="${d.uid}"]`).remove();
                });

            /**
             * 鼠标连线在画布上移动时动态更新连线
             * @return {[type]} [description]
             */
            function drawLineMove () {
                if (_this.connecting) {
                    _this.connector.select('path').attr('d', function (_d) {
                        return `M ${_d.x1} ${_d.y1} L ${_d.x2 = _this.$d3.event.x - 4} ${_d.y2 = _this.$d3.event.y}`;
                        // return _this.calculateLine({
                        //     p1: {
                        //         x: _d.x1,
                        //         y: _d.y1
                        //     },
                        //     p2: {
                        //         x: _d.x2 = _this.$d3.event.x - 4,
                        //         y: _d.y2 = _this.$d3.event.y
                        //     }
                        // });
                    });
                }
            }

            /**
             * 鼠标连线在画布上松开按键时删除当前连线(视为连线不成功)
             * @return {[type]} [description]
             */
            function drawLineUp () {
                if (_this.connecting) {
                    /** 去掉rect元素上连线point的connecting样式(标记为非连接状态) */
                    _this.$d3.select(`circle[bind-uid="${_this.connector.attr('input-uid')}"]`).classed('connecting', false);
                    /** 清空鼠标连线 */
                    _this.connector.remove();
                    _this.connector = null;
                    _this.connecting = false;
                }
            }
        }

        /**
         * 绘制rect元素icon
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function drawIcon (d) {
            if (d.type == 'dataset') { // 绘制dataset元素icon
                _this.instance
                    .append('use')
                    .attr('bind-uid', d.uid)
                    .attr('x', d.x + (d.width - 50) / 2)
                    .attr('y', d.y + (d.height - 50) / 2)
                    .attr('height', 50)
                    .attr('width', 50)
                    .attr('fill', '#cccccc')
                    .attr('xlink:href', d.source ? {
                        'GD': '#icon-logo-ds-googledrive',
                        'Upload': '#icon-logo-ds-upload'
                    }[d.source] : '#icon-add-dataset')
                    .classed('icon-dataset', true)
                    .classed('animated jelly', true)
                    .attr('style', `transform-origin: ${d.x + d.width / 2}px ${d.y + d.height / 2}px;-moz-transform-origin: ${d.x + d.width / 2}px ${d.y + d.height / 2}px;`)
            }
            if (d.type == 'operation') {
                _this.instance
                    .append('use')
                    .attr('bind-uid', d.uid)
                    .attr('bind-uid', d.uid)
                    .attr('x', d.x + (d.width - 50) / 2)
                    .attr('y', d.y + (d.height - 50) / 2)
                    .attr('height', 50)
                    .attr('width', 50)
                    .attr('fill', '#cccccc')
                    .attr('xlink:href', {
                        'Join': '#icon-duplicate',
                        'AppendRow': '#icon-nav'
                    }[d.name])
                    .classed('icon-dataset', true)
                    .classed('animated jelly', true)
                    .attr('style', `transform-origin: ${d.x + d.width / 2}px ${d.y + d.height / 2}px;-moz-transform-origin: ${d.x + d.width / 2}px ${d.y + d.height / 2}px;`)
            }
        }

        /**
         * 元素拖拽 - start
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function dragstarted (d) {
            /** 去掉rect元素的入场动画效果，防止在拖动结束时有动画效果 */
            _this.$d3.select(this).classed('animated jelly', false);
            /** 给rect元素添加dragging样式，并将其提升其在画布上的层级 */
            _this.$d3.select(this).raise().classed('dragging', true);

            /** 去掉rect元素上output的入场动画效果，防止在拖动结束时有动画效果 */
            _this.$d3.select(`circle[bind-uid="${d.uid}"]`).classed('animated jelly', false);
            /** 提升rect元素上output在画布上的层级 */
            _this.$d3.select(`circle[bind-uid="${d.uid}"]`).raise();

            /** 去掉rect元素上input的入场动画效果，防止在拖动结束时有动画效果 */
            _this.$d3.select(`path[bind-uid="${d.uid}"]`).classed('animated jelly', false);
            /** 提升rect元素上input在画布上的层级 */
            _this.$d3.select(`path[bind-uid="${d.uid}"]`).raise();

            /** 提升rect元素上的关闭按钮以及icon在画布上的层级 */
            _this.$d3.selectAll(`use[bind-uid="${d.uid}"]`).raise();
            /** 去掉icon的入场动画效果，防止在拖动结束时有动画效果 */
            _this.$d3.selectAll(`use[bind-uid="${d.uid}"]`).classed('animated jelly', false);

            vTime = _this.$d3.event.sourceEvent.timeStamp;
        }

        /**
         * 元素拖拽 - drag
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function draged (d) {
            /** rect元素在画布上拖拽重绘 */
            _this.$d3.select(this).attr('x', d.x = _this.$d3.event.x).attr('y', d.y = _this.$d3.event.y);

            /** rect元素的output在画布上拖拽重绘 */
            _this.$d3.select(`circle[bind-uid="${d.uid}"]`).attr('cx', _this.$d3.event.x + d.width).attr('cy', _this.$d3.event.y + d.height / 2);
            /** rect元素的input在画布上拖拽重绘 */
            _this.$d3.select(`path[bind-uid="${d.uid}"]`).attr('d', `M ${_this.$d3.event.x - 4} ${_this.$d3.event.y + d.height / 2 - 6} L ${_this.$d3.event.x + Math.sqrt(12 * 12 - 6 * 6) - 4} ${_this.$d3.event.y + d.height / 2} L ${_this.$d3.event.x - 4} ${_this.$d3.event.y + d.height / 2 + 6} z`);

            /** rect元素的关闭按钮在画布上拖拽重绘 */
            _this.$d3.select(`use[bind-uid="${d.uid}"].icon-close`).attr('x', _this.$d3.event.x + d.width - 12).attr('y', _this.$d3.event.y + 4);
            /** rect元素的icon在画布上拖拽重绘 */
            _this.$d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('x', _this.$d3.event.x + (d.width - 50) / 2).attr('y', _this.$d3.event.y + (d.height - 50) / 2);

            // 线的拖动
            _this.moveLine(d, _this.$d3.event.x, _this.$d3.event.y);

            /** 广播rect元素的拖拽事件 */
            _this.dispatcher.call('rect_move', _this, {data: d, event: _this.$d3.event});
        }

        /**
         * 元素拖拽 - end
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function dragended (d) {
            /** 去掉rect元素的拖动样式 */
            _this.$d3.select(this).classed('dragging', false);

            /** 模拟rect元素上的click事件 */
            if (_this.$d3.event.sourceEvent.timeStamp - vTime < 200) {
                /** 点击之前初始化点击 */
                if (_this.selectD && _this.selectD.uid != d.uid) {
                    _this.$d3.select(`use[bind-uid="${_this.selectD.uid}"].icon-close`).style('display', 'none');
                    _this.$d3.select(`rect[data-uid="${_this.selectD.uid}"]`).classed('focused', false);
                    _this.instance.on('keydown', null);
                }

                /** 展示或隐藏rect元素上的关闭按钮 */
                let close = _this.$d3.select(`use[bind-uid="${_this.$d3.select(this).attr('data-uid')}"].icon-close`);
                if (close.node().style.display === 'block') {
                    _this.selectD = null;

                    close.style('display', 'none');

                    _this.$d3.select(this).classed('focused', false);

                    _this.instance.on('keydown', null);
                } else {
                    _this.selectD = d;

                    close.style('display', 'block');

                    _this.$d3.select(this).classed('focused', true);

                    _this.instance.node().focus();
                    _this.instance.on('keydown', function () {
                        let rect = _this.$d3.select(`rect[data-uid="${d.uid}"]`),
                            icon = _this.$d3.select(`use[bind-uid="${d.uid}"].icon-dataset`),
                            output = _this.$d3.select(`circle[bind-uid="${d.uid}"]`),
                            input = _this.$d3.select(`path[bind-uid="${d.uid}"]`),
                            close = _this.$d3.select(`use[bind-uid="${d.uid}"].icon-close`);
                        switch (_this.$d3.event.keyCode) {
                            case 37:
                                rect.attr('x', d.x = d.x % 5 == 0 ? d.x - 5 : d.x - d.x % 5 - 5);
                                break;
                            case 38:
                                rect.attr('y', d.y = d.y % 5 == 0 ? d.y - 5 : d.y - d.y % 5 - 5);
                                break;
                            case 39:
                                rect.attr('x', d.x = d.x % 5 == 0 ? d.x + 5 : d.x - d.x % 5 + 5);
                                break;
                            case 40:
                                rect.attr('y', d.y = d.y % 5 == 0 ? d.y + 5 : d.y - d.y % 5 + 5);
                                break;
                            default:
                                break;
                        }

                        close.attr('x', d.x + d.width - 12).attr('y', d.y + 4);
                        output.attr('cx', d.x + d.width).attr('cy', d.y + d.height / 2);
                        icon.attr('x', d.x + (d.width - 50) / 2).attr('y', d.y + (d.width - 50) / 2);
                        input.attr('d', `M ${d.x - 4} ${d.y + d.height / 2 - 6} L ${d.x + Math.sqrt(12 * 12 - 6 * 6) - 4} ${d.y + d.height / 2} L ${d.x - 4} ${d.y + d.height / 2 + 6} z`);

                        _this.moveLine(d, d.x, d.y);
                    });
                }

                // 点击元素事件
                _this.dispatcher.call('rect_click', _this, {data: d, event: _this.$d3.event});
            }
        }

        /**
         * 鼠标在rect元素上抬起时，绘制连线
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function rectMouseUp (d) {
            if (_this.connecting) {
                if (_this.$d3.select(this).classed('connecting-unabled')) {
                    _this.$d3.select(this).classed('connecting-unabled', false);
                } else if (_this.connector.attr('input-uid') != d.uid) {
                    drawLineToCanvas(d);
                }
            }
        }

        /**
         * 鼠标移动到rect元素上时，处理事件
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function rectMouseOver (d) {
            if (_this.connecting) {
                if(_this.$d3.select(`path[bind-uid="${d.uid}"]`).empty() || _check()) {
                    _this.$d3.select(this).classed('connecting-unabled', true);
                }
            }

            // 条件判断
            function _check () {
                let check = false;

                if (!_this.$d3.select(`g[in-uid="${_this.connector.attr('input-uid')}"]`).empty()) {
                    _this.$d3
                        .selectAll(`g[in-uid="${_this.connector.attr('input-uid')}"]`)
                        .each(function () {
                            if (_this.$d3.select(this).attr('out-uid') == d.uid) {
                                check = true;
                            }
                        })
                }

                return check;
            }
        }

        /**
         * 鼠标离开rect元素时，处理事件
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function rectMouseLeave (d) {
            if (_this.connecting) {
                _this.$d3.select(this).classed('connecting-unabled', false);
            }
        }

        /**
         * 将连接成功的线绘制到画布
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function drawLineToCanvas (d) {
            if (_this.$d3.select(`g[out-uid="${d.uid}"]`).empty() || _this.$d3.select(`g[out-uid="${d.uid}"]`).attr('in-uid') != _this.connector.attr('input-uid')) {
                _this.connector.select('path').attr('d', function (_d) {
                    _this.line([
                        {
                            x1: _d.x1,
                            y1: _d.y1,
                            x2: d.x - 5,
                            y2: d.y + d.height / 2,
                            strokeDasharray: '3,5',
                            inUID: _this.connector.attr('input-uid'),   // 连线 start 连接的rect元素uid
                            outUID: d.uid                               // 连线 end 连接的rect元素uid
                        }
                    ]);
                });
            }
            /** 去掉rect元素上连线point的connecting样式(标记为非连接状态) */
            _this.$d3.select(`circle[bind-uid="${_this.connector.attr('input-uid')}"]`).classed('connecting', false);
            /** 清空鼠标连线 */
            _this.connector.remove();
            _this.connector = null;
            _this.connecting = false;
        }

        return this.instance;
    }

    /**
     * 连线绘制
     * @param  {Array}  [configs=[]] [description]
     * @return {[type]}              [description]
     */
    line (configs = []) {
        const _this = this;
        let lineData;

        lineData = this.instance
            .selectAll('g.connected')
            .data(configs)
            .enter()
            .append('g')
            .attr('in-uid', d => d.inUID)
            .attr('out-uid', d => d.outUID)
            .each(function (d) {
                _this.$d3
                    .select(this)
                    .append('path')
                    .attr('d', d => {
                        return _this.calculateLine({
                            p1: { x: d.x1, y: d.y1 },
                            p2: { x: d.x2, y: d.y2 }
                        });
                    })
                    .attr('stroke-dasharray', d => d.strokeDasharray)
                    .attr('fill', 'none')
                    .attr('stroke', '#cccccc')
                    .attr('stroke-width', 1)
                    .attr('data-type', 'connector');
                _this.$d3
                    .select(this)
                    .append('path')
                    .attr('d', d => {
                        return _this.calculateLine({
                            p1: { x: d.x1, y: d.y1 },
                            p2: { x: d.x2, y: d.y2 }
                        });
                    })
                    .attr('fill', 'none')
                    .attr('stroke', '#cccccc')
                    .attr('stroke-width', 10)
                    .attr('stroke-opacity', 0)
                    .attr('data-type', 'connector');
                // _this.$d3
                //     .select(this)
                //     .append('use')
                //     .attr('x', (d.x2 - d.x1) / 2 + d.x1 - 8)
                //     .attr('y', (d.y2 - d.y1) / 2 + d.y1)
                //     .attr('fill', '#cccccc')
                //     .attr('xlink:href', '#icon-close')
            })
            .on('click', function (d) {
                _this.$d3.select(this).remove();
            });
    }

    /**
     * 绘制连线或拖动连线时，计算连线的绘制方式
     * @param  {[type]} p1 [description]
     * @param  {[type]} p2 [description]
     * @return {[type]}    [description]
     */
    calculateLine ({ p1, p2 }) {
        const MAX_ARC_DIAMETER = 20;

        /** 画笔移动到初始点p1 */
        let connector = `M ${p1.x} ${p1.y} `;
        if ((Math.abs(calculateYDistance()) < 20 && calculateXDistance() < 0) || (Math.abs(calculateYDistance()) < 20 && Math.abs(calculateXDistance()) < 60)) {

        } else {
            /**
             * 当点p1在点p2右半侧的时候:
             *      画直线到 [p1.x + 20, p1.y] 处
             * 反之:
             *      画直线到 [(p2.x - p1.x) / 2 + p1.x - Math.abs(calculateYDistance()) / 2, p1.y]
             */
            connector += calculateXDistance() > 60 ? line(
                (p2.x - p1.x) / 2 + p1.x - Math.abs(calculateYDistance()) / 2,
                p1.y
            ) : line(
                p1.x + 20,
                p1.y
            );

            if (calculateXDistance() > 60) {
                /** 点p1在点p2左半侧 */

                if (Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER) {
                    /** 点p1和点p2的y轴距离大于等于拐角圆弧 */

                    connector += curve(
                        (p2.x - p1.x) / 2 + p1.x,
                        p1.y + calculateYDistance() / 2,
                        1
                    );
                } else {
                    /** 点p1和点p2的y轴距离小于拐角圆弧 */

                    connector += curve(
                        (p2.x - p1.x) / 2 + p1.x + Math.abs(calculateYDistance()) / 2,
                        p2.y
                    )
                }
            } else {
                /** 点p1在点p2右半侧 */

                connector += curve(
                    p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                    p1.y + calculateYDistance() / 2,
                    1
                );
            }

            if (calculateXDistance() < 60) {
                if (calculateXDistance() < 40) {
                    connector += line(
                        p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                        (p2.y - p1.y) / 2 + p1.y - calculateYDistance() / 2
                    );
                    connector += arc(
                        p1.x + 20,
                        (p2.y - p1.y) / 2 + p1.y,
                        p2.y > p1.y ? 1 : 0
                    );
                    connector += line(
                        p2.x - 20,
                        (p2.y - p1.y) / 2 + p1.y
                    );
                    connector += curve(
                        p2.x - 20 - Math.abs(calculateYDistance()) / 2,
                        (p2.y - p1.y) / 2 + p1.y + calculateYDistance() / 2,
                        1
                    );
                } else {
                    connector += line(
                        p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                        (p2.y - p1.y) / 2 + p1.y - calculateYDistance() / 2
                    );
                    connector += curveX(
                        p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                        (p2.y - p1.y) / 2 + p1.y - calculateYDistance() / 2,
                        p2.x - 20 - Math.abs(calculateYDistance()) / 2,
                        (p2.y - p1.y) / 2 + p1.y + calculateYDistance() / 2
                    );
                }
            }

            if (Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER) {
                connector += calculateXDistance() > 60 ? line(
                    (p2.x - p1.x) / 2 + p1.x,
                    p2.y - calculateYDistance() / 2
                ) : line(
                    p2.x - 20 - Math.abs(calculateYDistance()) / 2,
                    p2.y - calculateYDistance() / 2
                );

                connector += calculateXDistance() > 60 ? curve(
                    (p2.x - p1.x) / 2 + p1.x + Math.abs(calculateYDistance()) / 2,
                    p2.y,
                    0
                ) : arc(
                    p2.x - 20,
                    p2.y,
                    p2.y > p1.y ? 0 : 1
                );
            }
        }

        connector += line(
            p2.x,
            p2.y
        );

        /**
         * 直线绘制规则生成
         * @param  {[type]} x [description]
         * @param  {[type]} y [description]
         * @return {[type]}   [description]
         */
        function line (x, y) {
            return `L ${x} ${y} `;
        }

        /**
         * 圆弧绘制规则生成
         * @param  {[type]} x [description]
         * @param  {[type]} y [description]
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function arc (x, y, d) {
            return `A 10 10 0 0 ${d} ${x} ${y} `;
        }

        /**
         * 曲线（贝塞尔）绘制规则生成
         * @param  {[type]} x      [description]
         * @param  {[type]} y      [description]
         * @param  {[type]} d      [description]
         * @param  {[type]} forceC [description]
         * @return {[type]}        [description]
         */
        function curve (x, y, d, forceC) {
            let controlPoint = '';
            if (Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER && !forceC) {
                controlPoint = d == 1 ? `${x} ${y - calculateYDistance() / 2}` : `${x - Math.abs(calculateYDistance()) / 2} ${y}`;
            } else {
                controlPoint = !forceC ? `${x} ${y - calculateYDistance()} ${x - Math.abs(calculateYDistance())} ${y}` : `${x + 10 - (calculateXDistance() - 40) / 2} ${y} ${x} ${y + 10}`;
            }

            return `${Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER && !forceC ? 'Q' : 'C'} ${controlPoint} ${x} ${y} `;
        }

        /**
         * 曲线（贝塞尔）绘制规则生成 -- 根据x轴位置判断绘制
         * @param  {[type]} x1 [description]
         * @param  {[type]} y1 [description]
         * @param  {[type]} x2 [description]
         * @param  {[type]} y2 [description]
         * @return {[type]}    [description]
         */
        function curveX (x1, y1, x2, y2) {
            return `C ${x1} ${(y1 - y2) / 2 + y2} ${x2} ${(y1 - y2) / 2 + y2} ${x2} ${y2}`;
        }

        /**
         * 计算连线起始点和结束点的y轴相对位置信息
         * @return {[type]} [description]
         */
        function calculateYDistance () {
            if (Math.abs(p2.y - p1.y) > MAX_ARC_DIAMETER) {
                return p2.y - p1.y > 0 ? MAX_ARC_DIAMETER : -MAX_ARC_DIAMETER;
            } else {
                return p2.y - p1.y;
            }
        }

        /**
         * 计算连线起始点和结束点的x轴相对位置信息
         * @return {[type]} [description]
         */
        function calculateXDistance () {
            return p2.x - p1.x;
        }

        return connector;
    }

    /**
     * 绑定事件
     * @param  {[type]}   type [description]
     * @param  {Function} cb   [description]
     * @return {[type]}        [description]
     */
    on (type, cb) {
        this.dispatcher.on(type, cb);
    }

    /**
     * 容器大小修改事件监听
     * @param  {[type]} dom [description]
     * @return {[type]}     [description]
     */
    containerResize (dom) {
        const _this = this;
        window.document.body.onresize = function () {
            let domHTML =  document.querySelector(dom);

            _this.containerLeft = domHTML.offsetLeft;
        }
    }

    /**
     * 连线的移动
     * @param  {[type]} d  [description]
     * @param  {[type]} mx [description]
     * @param  {[type]} my [description]
     * @return {[type]}    [description]
     */
    moveLine (d, mx, my) {
        const _this = this;

        this.$d3.selectAll(`g[in-uid="${d.uid}"]`).each(function () {
            _this.$d3
                .select(this)
                .select('use')
                .attr('x', function (_d) {
                    return (_d.x2 - (_d.x1 = mx + d.width)) / 2 + (_d.x1 = mx + d.width) - 8;
                })
                .attr('y', function (_d) {
                    return (_d.y2 - (_d.y1 = my + d.height / 2)) / 2 + (_d.y1 = my + d.height / 2);
                })
            _this.$d3
                .select(this)
                .selectAll('path')
                .each(function () {
                    _this.$d3
                        .select(this)
                        .attr('d', function (_d) {
                            return _this.calculateLine({
                                p1: {
                                    x: _d.x1 = mx + d.width,
                                    y: _d.y1 = my + d.height / 2
                                },
                                p2: {
                                    x: _d.x2,
                                    y: _d.y2
                                }
                            });
                        });
                });
        });
        _this.$d3.selectAll(`g[out-uid="${d.uid}"]`).each(function () {
            _this.$d3
                .select(this)
                .select('use')
                .attr('x', function (_d) {
                    return ((_d.x2 = mx) - _d.x1) / 2 + _d.x1 - 8;
                })
                .attr('y', function (_d) {
                    return ((_d.y2 = my + d.height / 2) - _d.y1) / 2 + _d.y1;
                })
            _this.$d3
                .select(this)
                .selectAll('path')
                .each(function () {
                    _this.$d3
                        .select(this)
                        .attr('d', function (_d) {
                            return _this.calculateLine({
                                p1: {
                                    x: _d.x1,
                                    y: _d.y1
                                },
                                p2: {
                                    x: _d.x2 = mx,
                                    y: _d.y2 = my + d.height / 2
                                }
                            });
                        });
                });
        });
    }

    /**
     * 画布的拖拽
     * @return {[type]} [description]
     */
    dragCanvas () {
        const _this = this;
        let dragging    = false,
            dx          = 0,
            dy          = 0;

        this.onMouseDownFuncs.push(function () {
            /** 初始化选中的元素，并去掉选中状态 */
            if (_this.selectD && _this.$d3.event.target.nodeName != 'use') { // 当点击的不是删除按钮时才初始化
                _this.$d3.select(`use[bind-uid="${_this.selectD.uid}"].icon-close`).style('display', 'none');
                _this.$d3.select(`rect[data-uid="${_this.selectD.uid}"]`).classed('focused', false);
                _this.instance.on('keydown', null);
            }

            _this.$d3.select(this).style('cursor', '-webkit-grabbing');
            dragging = true;

            dx = _this.$d3.event.x;
            dy = _this.$d3.event.y;
        });

        this.onMouseMoveFunc.push(function () {
            if (dragging) {
                let selector = _this.$d3.select(this);

                selector.selectAll('rect')
                    .attr('x', function (d) {
                        let mx = d.x + _this.$d3.event.x - dx,
                            my = d.y + _this.$d3.event.y - dy;

                        _this.$d3.select(`circle[bind-uid="${d.uid}"]`).attr('cx', mx + d.width);
                        _this.$d3.select(`path[bind-uid="${d.uid}"]`).attr('d', `M ${mx - 4} ${my + d.height / 2 - 6} L ${mx + Math.sqrt(12 * 12 - 6 * 6) - 4} ${my + d.height / 2} L ${mx - 4} ${my + d.height / 2 + 6} z`);
                        _this.$d3.select(`use[bind-uid="${d.uid}"].icon-close`).attr('x', mx + d.width - 12);
                        _this.$d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('x', mx + (d.width - 50) / 2);

                        _this.moveLine(d, mx, my);

                        return mx;
                    })
                    .attr('y', function (d) {
                        _this.$d3.select(`circle[bind-uid="${d.uid}"]`).attr('cy', d.y + _this.$d3.event.y - dy + d.height / 2);
                        _this.$d3.select(`use[bind-uid="${d.uid}"].icon-close`).attr('y', d.y + _this.$d3.event.y - dy + 4);
                        _this.$d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('y', d.y + _this.$d3.event.y - dy + (d.height - 50) / 2)

                        return d.y + _this.$d3.event.y - dy;
                    });

            }
        });

        this.onMouseUpFuncs.push(function () {
            if (dragging) {
                _this.$d3.select(this).style('cursor', '-webkit-grab');

                let selector = _this.$d3.select(this);

                selector.selectAll('rect')
                    .attr('x', function (d) {
                        return d.x = d.x + _this.$d3.event.x - dx;
                    })
                    .attr('y', function (d) {
                        return d.y = d.y + _this.$d3.event.y - dy;
                    });

                dragging = false;
            }
        });
    }

    /**
     * 保存
     * @return {[type]} [description]
     */
    save () {
        let result = {
            rect: [],
            line: []
        };

        this.$d3.selectAll('rect[data-uid]').each(d => {
            result.rect.push(d);
        });

        this.$d3.selectAll('g[in-uid]').each(d => {
            result.line.push(d);
        });

        return result;
    }

    repaintRect (d) {
        this.$d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('xlink:href', {
            'GD': '#icon-logo-ds-googledrive',
            'Upload': '#icon-logo-ds-upload'
        }[d.source]);
    }
}
