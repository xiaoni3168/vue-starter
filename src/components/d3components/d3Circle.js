import D3Shape from './d3Shape';

export default class D3Circle extends D3Shape {
    constructor (container, config) {
        super(container, config);

        this.context = this.container.append('circle');
    }

    draw () {
        this.setHooks(this.config.hooks);
        return this.context
            .attr('cx', this.config.cx)
            .attr('cy', this.config.cy)
            .attr('r', this.config.r)
            .attr('fill', this.config.fill || 'none')
            .attr('stroke', this.config.stroke || '#333333')
            .attr('stroke-width', this.config.strokeWidth || 1)
            .on('click', this.config.onClick)
            .call(d3.drag()
                .on('drag', () => {
                    this.config.onDrag ? this.config.onDrag.call(this) : void 0;
                })
            );
    }

    repaint (event) {
        this.context
            .attr('cx', event.x)
            .attr('cy', event.y);
        this.updateHooks(event);
    }
}