import D3Shape from './d3Shape';

export default class D3Path extends D3Shape {
    constructor (container, config) {
        super(container, config);

        this.context = this.container.append('path');
    }

    draw () {
        return this.context
            .attr('fill', this.config.fill)
            .attr('stroke', this.config.stroke)
            .attr('stroke-width', this.config.strokeWidth)
            .attr('stroke-linecap', this.config.strokeLinecap)
            .attr('d', this.config.d);
    }
}