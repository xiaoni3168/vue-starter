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
            .grid-backdrop {
                background-color: #f0f0f0;
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
        backdrop: null,
        lockMoveH: false,
        lockMoveV: false,
        lockId: null,
        generate: function (container, defineInner) {
            var $t = this;

            container.className = container.className ? container.className + ' grid-container' : 'grid-container';
            container.addEventListener('mousemove', function (e) {
                _onContainerMove.call(this, $t, e);
            });

            this.backdrop = document.createElement('div');
            this.backdrop.setAttribute('class', 'grid-backdrop');
            this.backdrop.style.display = 'none';
            container.appendChild(this.backdrop);

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
        refresh: function (exceptId) {
            var $t = this;
            this.gridItems.forEach(function (gItem) {
                if (exceptId != gItem.getAttribute('grid-id')) {
                    gItem.style.height = `${gItem.getAttribute('grid-h')}px`;
                    gItem.style.width = `${gItem.getAttribute('grid-w')}px`;

                    var x = gItem.getAttribute('grid-x'),
                        y = gItem.getAttribute('grid-y')
                    gItem.style.transform = `translate(${x * ($t._options.minW + $t._options.gap)}px, ${y * ($t._options.minH + $t._options.gap)}px)`;
                }
            });
        },
        updateBackdrop: function (x, y, w, h) {
            this.backdrop.style.height = `${h}px`;
            this.backdrop.style.width = `${w}px`;
            this.backdrop.style.transform = `translate(${x * (this._options.minW + this._options.gap)}px, ${y * (this._options.minH + this._options.gap)}px)`;

            this.backdrop.setAttribute('grid-x', x);
            this.backdrop.setAttribute('grid-y', y);
        },
        lockH: function (id) {
            if (!this.lockId || id !== this.lockId) {
                this.lock(id);
                this.lockMoveH = true;
                this.lockMoveV = false;
            }
        },
        lockV: function (id) {
            if (!this.lockId || id !== this.lockId) {
                this.lock(id);
                this.lockMoveH = false;
                this.lockMoveV = true;
            }
        },
        isLockH: function () {
            return this.lockMoveH;
        },
        isLockV: function () {
            return this.lockMoveV;
        },
        lock: function (id) {
            this.lockId = id;
        },
        unlock: function () {
            this.lockMoveH = false;
            this.lockMoveV = false;
            this.lockId = null;
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
        
        this.style.transition = 'none';
        
        _startX = x * ($grid._options.minW + $grid._options.gap);
        _startY = y * ($grid._options.minH + $grid._options.gap);

        _deltaX = e.x;
        _deltaY = e.y;

        _mItem = this;

        $grid.backdrop.style.display = 'block';
        $grid.backdrop.style.height = this.style.height;
        $grid.backdrop.style.width = this.style.width;
        $grid.backdrop.style.transform = `translate(${_startX}px, ${_startY}px)`;
        $grid.backdrop.setAttribute('grid-x', x);
        $grid.backdrop.setAttribute('grid-y', y);
    }

    function _onGridItemUp ($grid, e) {
        _mItem.style.transition = 'transform .2s';
        
        let movedX = $grid.backdrop.getAttribute('grid-x'),
            movedY = $grid.backdrop.getAttribute('grid-y');
        
        _mItem.setAttribute('grid-x', movedX);
        _mItem.setAttribute('grid-y', movedY);
        $grid.refresh();

        _mItem = null;
        $grid.unlock();
    }

    function _onContainerMove ($grid, e) {
        if (_mItem) {
            _mItem.style.transform = `translate(${e.x + _startX - _deltaX}px, ${e.y + _startY - _deltaY}px)`;
            _itemCheck($grid, {
                x: e.x + _startX - _deltaX,
                y: e.y + _startY - _deltaY,
                w: +_mItem.getAttribute('grid-w'),
                h: +_mItem.getAttribute('grid-h'),
                _x: +_mItem.getAttribute('grid-x'),
                _y: +_mItem.getAttribute('grid-y'),
                id: _mItem.getAttribute('grid-id')
            })
        }
    }

    function _itemCheck ($grid, mItem) {
        var $items = $grid.gridItems;
        $items.forEach(function (item, i) {
            var id = item.getAttribute('grid-id'),
                 x = +item.getAttribute('grid-x'),
                 y = +item.getAttribute('grid-y'),
                 w = +item.getAttribute('grid-w'),
                 h = +item.getAttribute('grid-h');
            var rItem = {
                x: x * ($grid._options.minW + $grid._options.gap),
                y: y * ($grid._options.minH + $grid._options.gap),
                w: w,
                h: h
            }
            if (mItem.id != id) {
                if (_isOverlap(rItem, mItem)) {
                    mItem._y === y && $grid.lockH(id);
                    mItem._x === x && $grid.lockV(id);

                    /** 检测左右重叠--Start */
                    if ($grid.isLockH() && mItem.x > rItem.x && mItem.x < (rItem.x + rItem.w / 2 - 10)) {
                        item.style.transition = 'transform .3s';
                        item.setAttribute('grid-x', x + 1);
                        $grid.updateBackdrop(x, y, mItem.w, mItem.h);
                    }
                    if ($grid.isLockH() && mItem.x < rItem.x && (mItem.x + mItem.w) > (rItem.x + rItem.w / 2 + 10)) {
                        item.style.transition = 'transform .3s';
                        item.setAttribute('grid-x', x - 1);
                        $grid.updateBackdrop(x, y, mItem.w, mItem.h);
                    }
                    /** 检测左右重叠--End */

                    if ($grid.isLockV() && mItem.y > rItem.y && mItem.y < (rItem.y + rItem.w / 2 - 10)) {
                        item.style.transition = 'transform .3s';
                        item.setAttribute('grid-y', y + 1);
                        $grid.updateBackdrop(x, y, mItem.w, mItem.h);
                    }
                    if ($grid.isLockV() && mItem.y < rItem.y && (mItem.y + mItem.w) > (rItem.y + rItem.w / 2 + 10)) {
                        item.style.transition = 'transform .3s';
                        item.setAttribute('grid-y', y - 1);
                        $grid.updateBackdrop(x, y, mItem.w, mItem.h);
                    }
                }
            }
        });
        $grid.refresh(mItem.id);
    }

    function _isOverlap (r1, r2) {
        return !((r1.x + r1.w < r2.x) || (r1.y + r1.h < r2.y) || (r2.x + r2.w < r1.x) || (r2.y + r2.h < r1.y));
    }

    return Grid;
}));