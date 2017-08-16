import D3Shape from './d3Shape';

export default class D3G extends D3Shape {
    constructor (container, config) {
        super(container, config);

        this.context = this.container.append('g');
    }

    draw () {
        return this.context
            .attr('fill', 'transparent');
    }
}