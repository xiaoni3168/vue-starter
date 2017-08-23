import D3Shape from './d3Shape';

import { EventBus } from '../../event.bus';

export default class D3Rect extends D3Shape {
    constructor (container, config) {
        super(container, config);

        this.context = this.container.append('rect');

        this.position = [this.config.x, this.config.y];

        this.text = this.container.append('text').attr('id', `uuid_${this.config.name}`);
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
            .attr('style', this.config.style)
            .call(
                d3.drag()
                    .on('drag', () => {
                        this.config.onDrag ? this.config.onDrag.call(this) : void 0;
                    })
                    .on('start', () => {
                        this.config.onDragStart ? this.config.onDragStart.call(this) : void 0;
                    })
                    .on('end', () => {
                        this.config.onDragEnd ? this.config.onDragEnd.call(this) : void 0;
                    })
            )
            .on('mouseover', () => {
                if (this.type !== 'plugin') {
                    this.showPlugin();
                }
                window.d3.event.stopPropagation();
                this.config.onMouseOver ? this.config.onMouseOver.call(this) : void 0;
            })
            .on('mouseleave', () => {
                this.hidePlugin();
                this.config.onMouseLeave ? this.config.onMouseLeave.call(this) : void 0;
            })
            .on('click', () => {
                window.d3.event.stopPropagation();
                EventBus.$emit('clearPlugin');
                EventBus.$emit('activatedContext', this.config.name);
                this.config.onClick ? this.config.onClick.call(this) : void 0;
            });
    }

    repaint (event, updater) {
        let point;
        if (updater) {
            point = updater(event, this.config);
        }
        if (event) {
            let tPointX = this.boundaryCheck(point ? point[0] : (event.x - this.config.width / 2), [0, this.config.boundary[0]]);
            let tPointY = this.boundaryCheck(point ? point[1] : (event.y - this.config.height / 2), [0, this.config.boundary[1] - this.config.height]);
            this.context
                .attr('x', tPointX)
                .attr('y', tPointY);
            this.setPosition(tPointX, tPointY);
            this.drawText([tPointX, tPointY]);
            if (((point ? point[0] : (event.x - this.config.width / 2)) == tPointX) && ((point ? point[1] : (event.y - this.config.height / 2)) == tPointY)) {
                this.updateHooks(event);
                this.updatePlugins(event);
            }
        } else {
            this.context
                .attr('stroke-dasharray', 'none')
                .attr('stroke', '#999999')
                .attr('stroke-width', 2);
            this.drawText(this.position);
        }
    }

    drawText (position) {
        if (this.config.model && this.config.model.data && this.config.model.data.name) {
            this.container
                .select(`#uuid_${this.config.name}`)
                .attr('x', position[0] + this.config.width / 2)
                .attr('y', position[1] + this.config.height / 2)
                .attr('font-size', 12)
                .attr('stroke', '#333333')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .text(this.config.model.data.name);
        }
    }

    showPlugin () {
        this.plugins && this.plugins.forEach(plugin => {
            plugin.context.transition().styleTween('opacity', () => {
                return window.d3.interpolateNumber(0, 1);
            });
        });
    }

    hidePlugin () {
        this.plugins && this.plugins.forEach(plugin => {
            plugin.context.transition().styleTween('opacity', () => {
                return window.d3.interpolateNumber(1, 0);
            }).delay(400);
        });
    }

    setPosition (x, y) {
        this.position = [x, y];
    }
}