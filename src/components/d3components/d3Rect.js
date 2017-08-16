import D3Shape from './d3Shape';

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
            .attr('z-index', -1)
            .call(
                d3.drag()
                    .on('drag', () => {
                        this.config.onDrag ? this.config.onDrag.call(this) : void 0;
                    })
            )
            .on('click', () => {
                this.config.onDbClick ? this.config.onDbClick.call(this) : void 0;
            });
    }

    repaint (event) {
        this.context
            .attr('x', event.x - this.config.width / 2)
            .attr('y', event.y - this.config.height / 2);
        this.updateHooks(event);
    }
}