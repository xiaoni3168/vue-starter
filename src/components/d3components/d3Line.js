import D3Shape from './d3Shape';
import D3G from './d3G';

export default class D3Line extends D3Shape {
    constructor (container, config) {
        super(container, config);

        this.g = new D3G(this.container, {});
        this.gContext = this.g.draw();
        this.context = this.gContext.append('path');
        this.arrow = this.gContext.append('path');
        this.in = null;
        this.out = null;
    }

    draw () {
        this.arrow
            .attr('d', this.computArrow([this.config.x1, this.config.y1], [this.config.x2, this.config.y2]))
            .attr('fill', '#333');
        this.context
            .attr('d', this.computPath([this.config.x1, this.config.y1], [this.config.x2, this.config.y2]))
            .attr('stroke', this.config.stroke || '#333')
            .attr('stroke-width', this.config.strokeWidth || 1);
        
        return this.gContext;
    }

    repaint () {
        this.context
            .attr('d', this.computPath(this.in.point, this.out.point));
        this.arrow
            .attr('d', this.computArrow(this.in.point, this.out.point));
    }

    computPath (pointStart, pointEnd) {
        switch (this.in.position) {
            case 'right':
                return `M ${pointStart.join(' ')} L ${pointStart[0] + (pointEnd[0] - pointStart[0]) / 2} ${pointStart[1]} L ${pointStart[0] + (pointEnd[0] - pointStart[0]) / 2} ${pointEnd[1]} L ${pointEnd.join(' ')}`;
            case 'top':
            case 'bottom':
                return `M ${pointStart.join(' ')} L ${pointStart[0]} ${pointStart[1] + (pointEnd[1] - pointStart[1]) / 2} L ${pointEnd[0]} ${pointStart[1] + (pointEnd[1] - pointStart[1]) / 2} L ${pointEnd.join(' ')}`;

        }
    }

    computArrow (pointStart, pointEnd) {
        if (this.out) {
            switch (this.out.position) {
                case 'left':
                    return `M ${pointEnd[0] - 10} ${pointEnd[1] - 5} L ${pointEnd[0] - 10} ${pointEnd[1] + 5} L ${pointEnd.join(' ')} z`;
                case 'top':
                    return `M ${pointEnd[0] + 5} ${pointEnd[1] - 10} L ${pointEnd[0] - 5} ${pointEnd[1] - 10} L ${pointEnd.join(' ')} z`;
                case 'bottom':
                    return `M ${pointEnd[0] + 5} ${pointEnd[1] + 10} L ${pointEnd[0] - 5} ${pointEnd[1] + 10} L ${pointEnd.join(' ')} z`;
            }
        } else {
            switch (this.in.position) {
                case 'right':
                    return `M ${pointEnd[0] - 10} ${pointEnd[1] - 5} L ${pointEnd[0] - 10} ${pointEnd[1] + 5} L ${pointEnd.join(' ')} z`;
                case 'top':
                    return `M ${pointEnd[0] + 5} ${pointEnd[1] - 10} L ${pointEnd[0] - 5} ${pointEnd[1] - 10} L ${pointEnd.join(' ')} z`;
                case 'bottom':
                    return `M ${pointEnd[0] + 5} ${pointEnd[1] + 10} L ${pointEnd[0] - 5} ${pointEnd[1] + 10} L ${pointEnd.join(' ')} z`;
            }
        }
    }

    setIn (cxt) {
        this.in = cxt;
        return this;
    }

    setOut (cxt) {
        this.out = cxt;
        return this;
    }

    updateConfig (config) {
        this.config = Object.assign({}, this.config, config);
    }

    destroy () {
        this.gContext.remove();
    }
}