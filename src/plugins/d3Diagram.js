export default class D3Diagram {
    constructor ($d3) {
        this.$d3 = $d3;
        this.instance = null;
    }

    /**
     * 初始化画布
     * @param  {String} dom        初始化元素selector
     * @param  {Object} config     配置
     * @return {undefined}
     */
    init ({ dom, config = {} }) {
        this.instance = this.$d3.select(dom).append('svg');

        for (let [key, value] of Object.entries(config)) {
            this.instance.attr(key, value);
        }
    }

    /**
     * 获取当前画布的实例instance
     * @return {instance}
     */
    getInstance () {
        return this.instance;
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
            .each(function (d) {
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
                    .style('transform-origin', `${d.x + d.width / 2}px center`) : void 0;

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
            })
            .classed('animated jelly', true)
            .style('transform-origin', 'center');

        /** rect拖拽事件 */
        rectData.call(this.$d3
                        .drag()
                        .on('start',    dragstarted)
                        .on('drag',     draged)
                        .on('end',      dragended)
                    );

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

        function draged (d) {
            _this.$d3.select(this).attr('x', d.x = _this.$d3.event.x).attr('y', d.y = _this.$d3.event.y);

            _this.$d3.select(`circle[bind-uid="${d.uid}"]`).attr('cx', _this.$d3.event.x + d.width).attr('cy', _this.$d3.event.y + d.height / 2);
            _this.$d3.select(`path[bind-uid="${d.uid}"]`).attr('d', `M ${_this.$d3.event.x - 4} ${_this.$d3.event.y + d.height / 2 - 6} L ${_this.$d3.event.x + Math.sqrt(12 * 12 - 6 * 6) - 4} ${_this.$d3.event.y + d.height / 2} L ${_this.$d3.event.x - 4} ${_this.$d3.event.y + d.height / 2 + 6} z`);

            _this.$d3.select(`use[bind-uid="${d.uid}"]`).attr('x', _this.$d3.event.x + d.width - 12).attr('y', _this.$d3.event.y + 4);
        }

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

        return this.instance;
    }
}
