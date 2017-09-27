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
    }

    /**
     * 初始化画布
     * @param  {String} dom        初始化元素selector
     * @param  {Object} config     配置
     * @return {undefined}
     */
    init ({ dom, config = {} }) {
        const _this = this;

        /** 初始化工具实例 */
        this.instance = this.$d3.select(dom).append('svg');

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
            /** rect元素上 mouseup 事件(用于：连线) */
            .on('mouseup', rectMouseUp)
            .on('mouseover', rectMouseOver)
            .on('mouseleave', rectMouseLeave)
            /** rect元素添加到画布的动画效果添加 */
            .classed('animated jelly', true)
            .style('transform-origin', 'center');

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
                        .attr('input-uid', d.uid);
                    /** 添加rect元素上连线point的connecting样式(标记为连接状态) */
                    _this.$d3.select(this).classed('connecting', true);
                })
                .style('transform-origin', `${d.x + d.width / 2}px center`) : void 0;
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
                .style('transform-origin', `${d.x + d.width / 2}px center`) : void 0;
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

            /** 提升rect元素上的关闭按钮在画布上的层级 */
            _this.$d3.select(`use[bind-uid="${d.uid}"]`).raise();

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
            _this.$d3.select(`use[bind-uid="${d.uid}"]`).attr('x', _this.$d3.event.x + d.width - 12).attr('y', _this.$d3.event.y + 4);

            // 线的拖动
            _this.$d3.selectAll(`g[in-uid="${d.uid}"]`).each(function () {
                _this.$d3
                    .select(this)
                    .selectAll('path')
                    .each(function () {
                        _this.$d3
                            .select(this)
                            .attr('d', function (_d) {
                                return `M ${_d.x1 = _this.$d3.event.x + d.width} ${_d.y1 = _this.$d3.event.y + d.height / 2} L ${_d.x2} ${_d.y2}`;
                            });
                    });
            });
            _this.$d3.selectAll(`g[out-uid="${d.uid}"]`).each(function () {
                _this.$d3
                    .select(this)
                    .selectAll('path')
                    .each(function () {
                        _this.$d3
                            .select(this)
                            .attr('d', function (_d) {
                                return `M ${_d.x1} ${_d.y1} L ${_d.x2 = _this.$d3.event.x} ${_d.y2 = _this.$d3.event.y + d.height / 2}`;
                            });
                    });
            });
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
            if (_this.$d3.event.sourceEvent.timeStamp - vTime < 300) {
                /** 展示或隐藏rect元素上的关闭按钮 */
                let close = _this.$d3.select(`use[bind-uid="${_this.$d3.select(this).attr('data-uid')}"]`);
                if (close.node().style.display === 'block') {
                    close.style('display', 'none');

                    _this.$d3.select(this).classed('focused', false);
                } else {
                    close.style('display', 'block');

                    _this.$d3.select(this).classed('focused', true);
                }
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
                if(_this.$d3.select(`path[bind-uid="${d.uid}"]`).empty() && _this.connector.attr('input-uid') != d.uid) {
                    _this.$d3.select(this).classed('connecting-unabled', true);
                }
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
            _this.connector.select('path').attr('d', function (_d) {
                _this.line([
                    {
                        x1: _d.x1,
                        y1: _d.y1,
                        x2: d.x - 5,
                        y2: d.y + d.height / 2,
                        strokeDasharray: '5,3',
                        inUID: _this.connector.attr('input-uid'),   // 连线 start 连接的rect元素uid
                        outUID: d.uid                               // 连线 end 连接的rect元素uid
                    }
                ]);
            });
            /** 去掉rect元素上连线point的connecting样式(标记为非连接状态) */
            _this.$d3.select(`circle[bind-uid="${_this.connector.attr('input-uid')}"]`).classed('connecting', false);
            /** 清空鼠标连线 */
            _this.connector.remove();
            _this.connector = null;
            _this.connecting = false;
        }

        return this.instance;
    }

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
                        return `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`;
                    })
                    .attr('stroke-dasharray', d => d.strokeDasharray)
                    .attr('fill', 'none')
                    .attr('stroke', '#cccccc')
                    .attr('stroke-width', 1)
                _this.$d3
                    .select(this)
                    .append('path')
                    .attr('d', d => {
                        return `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`;
                    })
                    .attr('fill', 'none')
                    .attr('stroke', '#cccccc')
                    .attr('stroke-width', 10)
                    .attr('stroke-opacity', 0)
            });
    }
}
