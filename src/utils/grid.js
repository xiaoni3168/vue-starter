(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory);
    } else if (typeof exports === 'object') {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory();
    } else {
      // Browser globals (root is window)
      root.GridList = factory();
    }
}(this, function() {
    var Grid = function (item, options) {
        this._item      = item;
        this._options   = options;

        for (var k in this.defaults) {
            if (!this._options.hasOwnProperty(k)) {
                this._options[k] = this.defaults[k];
            }
        }

        var _style = document.createElement('style');
        _style.innerHTML = `
            .grid-container {
                position: relative;
            }
            .grid-item {
                background-color: #ffffff;
                position: absolute;
                top: 0;
                left: 0;
            }
        `;

        document.head.appendChild(_style);
    }

    Grid.prototype = {
        defaults: {
            node: 'div',
            minH: 300,
            minW: 300,
            gap: 10
        },
        gridItems: [],
        generate: function (container, defineInner) {
            var $t = this;

            container.className = container.className ? container.className + ' grid-container' : 'grid-container';
            container.addEventListener('mousemove', function (e) {
                _onContainerMove.call(this, $t, e);
            });

            for (var i = 0; i < this._item.length; i++) {
                var innerDom = defineInner(this._item[i], i);
                var innerWarp = document.createElement(this._options.node);

                innerWarp.setAttribute('grid-id', this._item[i].id);
                innerWarp.setAttribute('class', 'grid-item');
                innerWarp.setAttribute('grid-h', this._item[i].h);
                innerWarp.setAttribute('grid-w', this._item[i].w);
                innerWarp.setAttribute('grid-x', this._item[i].x);
                innerWarp.setAttribute('grid-y', this._item[i].y);

                innerWarp.addEventListener('mousedown', function (e) {
                    _onGridItemDown.call(this, $t, e);
                });
                innerWarp.addEventListener('mouseup', function (e) {
                    _onGridItemUp.call(this, $t, e);
                });

                innerWarp.innerHTML = innerDom;

                container.appendChild(innerWarp);

                this.gridItems.push(innerWarp);

                this.refresh();
            }
        },
        refresh: function () {
            var $t = this;
            this.gridItems.forEach(function (gItem) {
                gItem.style.height = `${gItem.getAttribute('grid-h')}px`;
                gItem.style.width = `${gItem.getAttribute('grid-w')}px`;

                var x = gItem.getAttribute('grid-x'),
                    y = gItem.getAttribute('grid-y')
                gItem.style.transform = `translate(${x * ($t._options.minW + $t._options.gap)}px, ${y * ($t._options.minH + $t._options.gap)}px)`;
            })
        }
    }

    var _startX = 0,
        _startY = 0,
        _deltaX = 0,
        _deltaY = 0,
        _mItem = null;

    function _onGridItemDown ($grid, e) {
        var x = this.getAttribute('grid-x'),
            y = this.getAttribute('grid-y');
        
        _startX = x * ($grid._options.minW + $grid._options.gap);
        _startY = y * ($grid._options.minH + $grid._options.gap);

        _deltaX = e.x;
        _deltaY = e.y;

        _mItem = this;
    }

    function _onGridItemUp (index, e) {

    }

    function _onContainerMove ($grid, e) {
        if (_mItem) {
            _mItem.style.transform = `translate(${e.x + _startX - _deltaX}px, ${e.y + _startY - _deltaY}px)`;
        }
    }

    return Grid;
}));