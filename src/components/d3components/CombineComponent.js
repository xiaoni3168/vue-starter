import D3G from './d3G';
import D3Circle from './d3Circle';
import D3Line from './d3Line';
import D3Rect from './d3Rect';

export default class CombineComponent {
    constructor (container, config) {
        this.container = container;
        this.config = config;
    }

    draw () {
        let g = new D3G(this.container, this.config.d3G || {});
        let gContext = g.draw();
        let context = {
            $circle: new D3Circle(gContext, this.config.d3Circle),
            $rect1: new D3Rect(gContext, this.config.d3Rect1),
            $rect2: new D3Rect(gContext, this.config.d3Rect2),
            $rect3: new D3Rect(gContext, this.config.d3Rect3)
        }

        let $line1 = new D3Line(gContext, {
            x1: this.config.d3Rect1.hooks[0].point[0],
            y1: this.config.d3Rect1.hooks[0].point[1],
            x2: this.config.d3Circle.hooks[0].point[0],
            y2: this.config.d3Circle.hooks[0].point[1],
            stroke: '#2888e5',
            strokeWidth: 1
        });
        let $line2 = new D3Line(gContext, {
            x1: this.config.d3Rect2.hooks[0].point[0],
            y1: this.config.d3Rect2.hooks[0].point[1],
            x2: this.config.d3Circle.hooks[1].point[0],
            y2: this.config.d3Circle.hooks[1].point[1],
            stroke: '#2888e5',
            strokeWidth: 1
        });
        let $line3 = new D3Line(gContext, {
            x1: this.config.d3Circle.hooks[2].point[0],
            y1: this.config.d3Circle.hooks[2].point[1],
            x2: this.config.d3Rect3.hooks[0].point[0],
            y2: this.config.d3Rect3.hooks[0].point[1],
            stroke: '#2888e5',
            strokeWidth: 1
        });

        $line1.setIn(this.config.d3Rect1.hooks[0]);
        $line1.setOut(this.config.d3Circle.hooks[0]);
        $line2.setIn(this.config.d3Rect2.hooks[0]);
        $line2.setOut(this.config.d3Circle.hooks[1]);
        $line3.setIn(this.config.d3Circle.hooks[2]);
        $line3.setOut(this.config.d3Rect3.hooks[0]);
        
        this.config.d3Circle.hooks[0].connector = $line1;
        this.config.d3Rect1.hooks[0].connector = $line1;
        this.config.d3Circle.hooks[1].connector = $line2;
        this.config.d3Rect2.hooks[0].connector = $line2;
        this.config.d3Circle.hooks[2].connector = $line3;
        this.config.d3Rect3.hooks[0].connector = $line3;
        
        for(let key in context) {
            context[key].draw();
        }
        $line1.draw();
        $line2.draw();
        $line3.draw();

        return { g, ...context };
    }
}