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
        let outline = new D3Circle(this.context, this.config).draw();
        let x = new D3Path(this.context, {
            d: `M ${this.config.cx - this.config.r / 3} ${this.config.cy - this.config.r / 3} L ${this.config.cx + this.config.r / 3} ${this.config.cy + this.config.r / 3} M ${this.config.cx + this.config.r / 3} ${this.config.cy - this.config.r / 3} L ${this.config.cx - this.config.r / 3} ${this.config.cy + this.config.r / 3}`,
            stroke: '#ffffff',
            strokeWidth: 3,
            strokeLinecap: 'round'
        }).draw();

        return this;
    }

    showClose () {
        this.context
            .transition()
            .styleTween('opacity', () => {
                return window.d3.interpolateNumber(0, 1)
            })
            .styleTween('transform', () => {
                return window.d3.interpolateTransformCss(`translate(-20px, 20px)`, `translate(0px, 0px)`);
            })
            .duration(300)
            .on('start', () => {
                this.status = true;
            });
    }

    hideClose () {
        this.status = false;
        this.context
            .transition()
            .styleTween('opacity', () => {
                return window.d3.interpolateNumber(1, 0)
            })
            .styleTween('transform', () => {
                return window.d3.interpolateTransformCss(`translate(0px, 0px)`, `translate(-20px, 20px)`);
            })
            .duration(300)
            .on('end', () => {
                this.status = false;
            });
    }
}