import D3Shape from './d3Shape';

import { EventBus } from '../../event.bus';

export default class D3Rect extends D3Shape {
    constructor (container, config) {
        super(container, config);

        this.context = this.container.append('rect');
    }

    draw () {
        this.setHooks(this.config.hooks);
        return this.context
            .attr('x', this.config.x)
            .attr('y', this.config.y)
            .attr('width', this.config.width)
            .attr('height', this.config.height)
            .attr('rx', this.config.rx)
            .attr('ry', this.config.ry)
            .attr('fill', this.config.fill)
            .attr('stroke', this.config.stroke || '#333333')
            .attr('stroke-width', this.config.strokeWidth || 1)
            .attr('stroke-dasharray', this.config.strokeDassarray)
            .attr('tabindex', 0)
            .call(
                d3.drag()
                    .on('drag', () => {
                        this.config.onDrag ? this.config.onDrag.call(this) : void 0;
                    })
            )
            .on('click', () => {
                window.d3.event.stopPropagation();
                EventBus.$emit('activatedContext', this.config.name);
                this.plugins && this.plugins.forEach(plugin => {
                    plugin.context.transition().styleTween('opacity', () => {
                        return window.d3.interpolateNumber(0, 1);
                    });
                });
                this.config.onClick ? this.config.onClick.call(this) : void 0;
            });
    }

    repaint (event, updater) {
        let point;
        if (updater) {
            point = updater(event, this.config);
        }
        let tPointX = this.boundaryCheck(point ? point[0] : (event.x - this.config.width / 2), [0, this.config.boundary[0]]);
        let tPointY = this.boundaryCheck(point ? point[1] : (event.y - this.config.height / 2), [0, this.config.boundary[1] - this.config.height]);
        this.context
            .attr('x', tPointX)
            .attr('y', tPointY);
        if (((point ? point[0] : (event.x - this.config.width / 2)) == tPointX) && ((point ? point[1] : (event.y - this.config.height / 2)) == tPointY)) {
            this.updateHooks(event);
            this.updatePlugins(event);
        }
    }
}