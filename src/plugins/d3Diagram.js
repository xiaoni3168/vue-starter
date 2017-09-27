export default class D3Diagram {
    constructor ($d3) {
        this.$d3 = $d3;
        this.instance = null;

        this.onMouseDownFuncs = [];
        this.onMouseUpFuncs = [];
        this.onMouseMoveFunc = [];

        this.connecting = false;
        this.connector = null;
    }

    /**
     * 初始化画布
     * @param  {String} dom        初始化元素selector
     * @param  {Object} config     配置
     * @return {undefined}
     */
    init ({ dom, config = {} }) {
        const _this = this;

        this.instance = this.$d3.select(dom).append('svg');

        for (let [key, value] of Object.entries(config)) {
            this.instance.attr(key, value);
        }

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
            })
    }

    /**
     * 获取当前画布的实例instance
     * @return {instance}
     */
    getInstance () {
        return this.instance;
    }

    setMouseDownFuncs (func) {
        this.onMouseDownFuncs.push(func);
    }

    setMouseUpFuncs (func) {
        this.onMouseUpFuncs.push(func);
    }

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
        let _this = this;
        let dx = 0,
            dy = 0,
            vTime = 0;

        let rectData = this.instance
            .selectAll('rect')
            .data(configs)
            .enter()
            .append('rect')
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
            .each(drawHook)
            .classed('animated jelly', true)
            .style('transform-origin', 'center');

        /** rect拖拽事件 */
        rectData.call(this.$d3
                        .drag()
                        .on('start',    dragstarted)
                        .on('drag',     draged)
                        .on('end',      dragended)
                    );

        /** -Define Function- */
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
                .on('mousedown', function () {
                    _this.connecting = true;
                    _this.$d3.select(this).classed('connecting', true);
                    _this.connector = _this.instance
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
                .on('mouseup', function () {
                    if (_this.connecting) {
                        _this.connector.attr('d', function (_d) {
                            _this.line([
                                {
                                    x1: _d.x1,
                                    y1: _d.y1,
                                    x2: d.x - 5,
                                    y2: d.y + d.height / 2,
                                    strokeDasharray: '5,3',
                                    inUID: _this.connector.attr('input-uid'),
                                    outUID: d.uid
                                }
                            ]);
                        });

                        _this.$d3.select(`circle[bind-uid="${_this.connector.attr('input-uid')}"]`).classed('connecting', false);

                        _this.connector.remove();
                        _this.connector = null;
                        _this.connecting = false;
                    }
                })
                .style('transform-origin', `${d.x + d.width / 2}px center`) : void 0;
            _this.setMouseMoveFunc(drawLineMove);
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
                    _this.$d3.selectAll(`[bind-uid="${d.uid}"]`).each(function () {
                        _this.$d3.select(this).remove();
                    });
                    _this.$d3.select(`[data-uid="${d.uid}"]`).remove();
                });
        }

        /**
         * 元素拖拽 - start
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function dragstarted (d) {
            _this.$d3.select(this).classed('animated jelly', false);
            _this.$d3.select(this).raise().classed('dragging', true);

            _this.$d3.select(`circle[bind-uid="${d.uid}"]`).classed('animated jelly', false);
            _this.$d3.select(`circle[bind-uid="${d.uid}"]`).raise();

            _this.$d3.select(`path[bind-uid="${d.uid}"]`).classed('animated jelly', false);
            _this.$d3.select(`path[bind-uid="${d.uid}"]`).raise();

            _this.$d3.select(`use[bind-uid="${d.uid}"]`).raise();

            vTime = _this.$d3.event.sourceEvent.timeStamp;
        }

        /**
         * 元素拖拽 - drag
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function draged (d) {
            _this.$d3.select(this).attr('x', d.x = _this.$d3.event.x).attr('y', d.y = _this.$d3.event.y);

            _this.$d3.select(`circle[bind-uid="${d.uid}"]`).attr('cx', _this.$d3.event.x + d.width).attr('cy', _this.$d3.event.y + d.height / 2);
            _this.$d3.select(`path[bind-uid="${d.uid}"]`).attr('d', `M ${_this.$d3.event.x - 4} ${_this.$d3.event.y + d.height / 2 - 6} L ${_this.$d3.event.x + Math.sqrt(12 * 12 - 6 * 6) - 4} ${_this.$d3.event.y + d.height / 2} L ${_this.$d3.event.x - 4} ${_this.$d3.event.y + d.height / 2 + 6} z`);

            _this.$d3.select(`use[bind-uid="${d.uid}"]`).attr('x', _this.$d3.event.x + d.width - 12).attr('y', _this.$d3.event.y + 4);

            // 线的拖动
            _this.$d3.selectAll(`path[in-uid="${d.uid}"]`).each(function () {
                _this.$d3
                    .select(this)
                    .attr('d', function (_d) {
                        return `M ${_d.x1 = _this.$d3.event.x + d.width} ${_d.y1 = _this.$d3.event.y + d.height / 2} L ${_d.x2} ${_d.y2}`;
                    })
            });
            _this.$d3.selectAll(`path[out-uid="${d.uid}"]`).each(function () {
                _this.$d3
                    .select(this)
                    .attr('d', function (_d) {
                        return `M ${_d.x1} ${_d.y1} L ${_d.x2 = _this.$d3.event.x} ${_d.y2 = _this.$d3.event.y + d.height / 2}`;
                    })
            });
        }

        /**
         * 元素拖拽 - end
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function dragended(d) {
            _this.$d3.select(this).classed('dragging', false);

            if (_this.$d3.event.sourceEvent.timeStamp - vTime < 300) {
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

        function drawLineMove () {
            if (_this.connecting) {
                _this.connector.attr('d', function (d) {
                    return `M ${d.x1} ${d.y1} L ${d.x2 = _this.$d3.event.x - 2} ${d.y2 = _this.$d3.event.y}`;
                });
            }
        }

        function drawLineUp () {

        }

        return this.instance;
    }

    line (configs = []) {
        let lineData = this.instance
            .selectAll('path.connected')
            .data(configs)
            .enter()
            .append('path')
            .attr('d', d => {
                return `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`;
            })
            .attr('stroke-dasharray', d => d.strokeDasharray)
            .attr('fill', 'none')
            .attr('stroke', '#cccccc')
            .attr('stroke-width', 1)
            .attr('in-uid', d => d.inUID)
            .attr('out-uid', d => d.outUID)
    }
}
