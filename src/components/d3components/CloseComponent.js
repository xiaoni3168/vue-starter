import D3Circle from './d3Circle';
import D3Path from './d3Path';
import D3G from './d3G';

export default class CloseComponent {
    constructor (container, config) {
        this.container = container;
        this.config = config;

        this.context = new D3G(this.container, {})
            .draw()
            .attr('style', 'opacity: 0')
            .on('click', () => {
                this.config.onClick ? this.config.onClick.call(this) : void 0;
            });
        this.status = false;
    }

    draw () {
        let outline = new D3Circle(this.context, Object.assign({}, this.config, {
            updater: (uEvent, config, context) => {
                this.context.style('transform', 'translate(30px, -30px)');
            }
        }));
        let x = new D3Path(this.context, {
            d: `M ${this.config.cx - this.config.r / 3} ${this.config.cy - this.config.r / 3} L ${this.config.cx + this.config.r / 3} ${this.config.cy + this.config.r / 3} M ${this.config.cx + this.config.r / 3} ${this.config.cy - this.config.r / 3} L ${this.config.cx - this.config.r / 3} ${this.config.cy + this.config.r / 3}`,
            r: this.config.r,
            stroke: '#ffffff',
            strokeWidth: 3,
            strokeLinecap: 'round'
        });
        outline.draw();
        x.draw();

        let contexts = [outline, x];
        contexts.$context = this;

        return contexts;
    }

    showClose () {
        this.context
            .transition()
            .style('opacity', () => 1)
            .on('start', () => {
                this.status = true;
            });
    }

    hideClose () {
        this.status = false;
        this.context
            .transition()
            .style('opacity', () => 0)
            .on('end', () => {
                this.status = false;
            });
    }
}