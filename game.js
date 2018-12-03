'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
            if (!Vector.prototype.isPrototypeOf(vector)) {
                throw new Error ('����� ���������� � ������� ������ ������ ���� Vector');
            }
            let x = this.x + vector.x;
            let y = this.y + vector.y;
            let result = new Vector(x, y);
            return result;
    }

    times(factor) {
        let result = new Vector(this.x * factor, this.y * factor);
        return result;
    }
};

class Actor {
    constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if (!Vector.prototype.isPrototypeOf(position) || !Vector.prototype.isPrototypeOf(size) || !Vector.prototype.isPrototypeOf(speed)) {
            throw new Error('����� ������������ ������ ������ ���� Vector');
        }
        this.pos = position;
        this.size = size;
        this.speed = speed;

        Object.defineProperty(this, 'left', {
            get: function () {
                return this.pos.x;
            },
            writeble: false
        })
        Object.defineProperty(this, 'right', {
            get: function () {
                return this.pos.x + this.size.x;
            },
            writeble: false
        })
        Object.defineProperty(this, 'top', {
            get: function () {
                return this.pos.y;
            },
            writeble: false
        })
        Object.defineProperty(this, 'bottom', {
            get: function () {
                return this.pos.y + this.size.y;
            },
            writeble: false
        })
        Object.defineProperty(this, 'type', {
            value: 'actor',
            writeble: false,
            configurable: true
        })
    }

    act() { }

    isIntersect(someObj) {
            if (!Actor.prototype.isPrototypeOf(someObj) || someObj === 'undefined') {
                throw new Error('����� ������������ ������ ������ ���� Actor');
            };

            if (someObj === this) {
                return false;
            }

            return this.left < someObj.right && this.top < someObj.bottom && this.right > someObj.left && this.bottom > someObj.top;
    }
}


class Level {
    constructor(grid = [], arrActors = []) {
        this.grid = grid;
        this.actors = arrActors;
        this.height = grid.length;
        this.width = grid.reduce(((max, arr) => (arr.length > max) ? arr.length : max), 0);
        this.status = null;
        this.finishDelay = 1;
        this.player = this.actors.find(el => {
          el.type === 'player'
          console.log(el);
        });
    }

    isFinished() {
        if (this.status !== null && this.finishDelay < 0) {
            return true;
        } else {
            return false;
        }
    }

    actorAt(someActor) {
            if (someActor === 'undefined' || !Actor.prototype.isPrototypeOf(someActor)) {
                throw new Error ('�� �������� �������� ���� Actor');
            }
            for (let insideActor of this.actors) {
                if (insideActor.isIntersect(someActor)) {
                    return insideActor;
                }
            }
     }

    obstacleAt(posNext, size) {
        if (!Vector.prototype.isPrototypeOf(posNext) && !Vector.prototype.isPrototypeOf(size)) {
                throw new Error ('����� ������������ ������ ������ ���� Vector');
        }

        const leftBorder = Math.floor(posNext.x);
        const topBorder = Math.floor(posNext.y);
        const rightBorder = Math.ceil(posNext.x + size.x);
        const bottomBorder = Math.ceil(posNext.y + size.y);

        if (leftBorder < 0 || rightBorder > this.width || topBorder < 0) {
            return 'wall';
        }

        if (bottomBorder > this.height) {
            return 'lava';
        }

        for (let x = leftBorder; x < rightBorder; x++) {
            for (let y = topBorder; y < bottomBorder; y++) {
                if (this.grid[y][x] === 'wall' || this.grid[y][x] === 'lava') {
                    return this.grid[y][x];
                }
            }
        }
    }

    removeActor(someActor) {
        let removeActor = this.actors.findIndex(el => el['type'] === someActor['type'])
        if (removeActor !== -1) {
            this.actors.splice(removeActor, 1)
        }
    }

    noMoreActors(someType) {
        if (this.actors.some(el => el.type === 'actor')) {
            return this.actors.some(el => el.type === someType);
        }
        return true;
    }

    playerTouched(someType, touchedActor) {
        if (this.status !== null) {
            return;
        }
        if (someType === 'lava' || someType === 'fireball') {
            this.status = 'lost';
        } else if (someType === 'coin') {
            this.removeActor(touchedActor)
            if (this.noMoreActors('coin')) {
                this.status = 'won';
            }
        }
    }
}


class LevelParser {
    constructor(parser) {
        this.parser = parser;
    }

    actorFromSymbol(symbol) {
        for (let key in this.parser) {
            if (key === symbol) {
                ;
                return this.parser[key];
            }
        }
    }

    obstacleFromSymbol(symbol) {
        if (symbol === 'x') {
            return 'wall';
        } else if (symbol === '!') {
            return 'lava';
        }
    }

    createGrid(someArr) {
        let grid = [];
        var j = 0;
        for (let el of someArr) {
            grid[j] = new Array(el.length)
            for (let i = 0; i < el.length; i++) {
                grid[j][i] = this.obstacleFromSymbol(el[i]);
            }
            j++;
        }

        return grid;
    }

    createActors(someArr) {
        let actorsArr = [];
        for (let i = 0; i < someArr.length; i++) {
            for (let j = 0; j < someArr[i].length; j++) {
                let constr = this.actorFromSymbol(someArr[i][j]);

                if (constr && typeof (constr) === 'function') {
                    let objectActor = new constr(new Vector(j, i));

                    if (objectActor instanceof Actor) {
                        actorsArr.push(objectActor);
                    }

                };
            };
        };
        return actorsArr;
    }

    parse(someArr) {
       return new Level(this.createGrid(someArr), this.createActors(someArr))
    }
}


class Fireball extends Actor {
    constructor(position = new Vector(0, 0), speed = new Vector(0, 0)) {
        let size = new Vector(1, 1);
        super(position, size, speed);
        Object.defineProperty(this, 'type', {
            value: 'fireball',
            writable: false
        })
    }

    getNextPosition(time = 1) {
        return this.pos.plus(new Vector(time * this.speed.x, time * this.speed.y));
    }

    handleObstacle() {
        this.speed.y = this.speed.y * -1;
        this.speed.x = this.speed.x * -1;
    }

    act(time, someLevel) {
        let nextPosition = this.getNextPosition(time);
        if (someLevel.obstacleAt(nextPosition, this.size)) {
            this.handleObstacle();
        } else {
            this.pos = nextPosition;
        }
    }
}


class HorizontalFireball extends Fireball {
    constructor(position = new Vector(), speed = new Vector(2, 0)) {
        super(position, speed);
    }
}

class VerticalFireball extends Fireball {
    constructor(position = new Vector(), speed = new Vector(0, 2)) {
        super(position, speed);
    }
}

class FireRain extends Fireball {
    constructor(position = new Vector(), speed = new Vector(0, 3)) {
        super(position, speed);
        this.startPos = position;
    }

    handleObstacle() {
        this.pos = new Vector(this.startPos.x, this.startPos.y);
    }
}

class Coin extends Actor {
    constructor(position = new Vector()) {
        let basePos = position.plus(new Vector(0.2, 0.1))
        super(basePos);
        this.basePos = basePos;

        Object.defineProperty(this, 'type', {
            value: 'coin',
            writable: false
        })

        this.size = new Vector(0.6, 0.6);
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = 2 * Math.PI * Math.random();
    }

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);
        return this.basePos.plus(this.getSpringVector());
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor {
    constructor(position = new Vector()) {
        super(new Vector(position.x, position.y - 0.5), new Vector(0.8, 1.5));
        Object.defineProperty(this, 'type', {
            value: 'player',
            writeble: false
        })
    }
}
