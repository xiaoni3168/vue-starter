import D3Shape from './d3Shape';

export default class D3Line extends D3Shape {
    constructor (container, config) {
        super(container, config);

        this.context = this.container.append('path');
        this.arrow = this.container.append('path');
        this.in = null;
        this.out = null;
    }

    draw () {
        this.arrow
            .attr('d', this.computArrow([this.config.x1, this.config.y1], [this.config.x2, this.config.y2]))
            .attr('fill', '#333');
        return this.context
            .attr('d', this.computPath([this.config.x1, this.config.y1], [this.config.x2, this.config.y2]))
            .attr('stroke', this.config.stroke || '#333')
            .attr('stroke-width', this.config.strokeWidth || 1);
    }

    repaint () {
        this.context
            .attr('d', this.computPath(this.in.point, this.out.point));
        this.arrow
            .attr('d', this.computArrow(this.in.point, this.out.point));
    }

    computPath (pointStart, pointEnd) {
        return `M ${pointStart.join(' ')} L ${pointStart[0]} ${pointEnd[1]} L ${pointEnd.join(' ')}`;
    }

    computArrow (pointStart, pointEnd) {
        return `M ${pointEnd[0] - 10} ${pointEnd[1] - 5} L ${pointEnd[0] - 10} ${pointEnd[1] + 5} L ${pointEnd.join(' ')} z`;
    }

    setIn (cxt) {
        this.in = cxt;
        return this;
    }

    setOut (cxt) {
        this.out = cxt;
        return this;
    }
}