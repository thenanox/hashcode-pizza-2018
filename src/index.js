const io = require('./io-loader');
let time = 0;

function calculateTime(early) {
    return (early - time < 0) ? 0 : early - time;
}

async function hashcode(inputFile, outputFile) {
    const model = await io.inputLoader(inputFile);
    const pool = createTripPool(model.trips);
    const solution = startSimulation(model, pool);
    io.prepareOutput(outputFile, solution);
}

function createTripPool(trips){
    const pool = trips.slice(0);
    pool.sort( (a, b) => parseInt(a.early) - parseInt(b.early));
    return pool;
}

function startSimulation(model, pool) {
    const cars = createCars(model.F);
    for(time = 0; time < model.T; time++) {
        if(simulationFinished(cars, pool)) {
            break;
        }
        step(cars, pool);
    }
    return cars.map( car => car.print()).join('\n');
}

function simulationFinished(cars, pool) {
    if(!pool.length) {
        return cars.reduce( (prev, next) => {
            return {busy: !prev.busy && !next.busy}; 
        });
    }
}

function createCars(cars) {
    const carsList = [];
    for(let i = 0; i < cars; i++) {
        const car = {};
        car.busy = 0;
        car.index = i;
        car.tripsLog = [];
        car.position = {
            x: 0,
            y: 0
        };
        car.trip = {};
        car.update = update;
        car.pick = pick;
        car.calculateDistance = calculateDistance;
        car.isFinished = isFinished;
        car.move = move;
        car.print = print;
        car.calculateBusy = calculateBusy;
        carsList.push(car);
    }
    return carsList;
}

function step(cars, pool) {
    cars.forEach( car => {
        // console.log('UPDATE', car.index);
        car.update(pool);
    })
}

function update(pool) {
    // console.log(this.busy)
    if(!this.busy || this.isFinished()) {
        // console.log('PICK', this.index);
        this.pick(pool);
    } else {
        // console.log('MOVE', this.index);        
        this.move();
    }
}

function calculateBusy(trip) {
    return this.calculateDistance(this.position, trip.start) +
            calculateTime(trip.early) +
            this.calculateDistance(trip.start, trip.end);
}

function pick(pool) {
    // this.trip = pool.shift();
    // console.log('pool', pool);
    const possibleTrips = pool.slice(0);
    const possibleTimes = possibleTrips.map(trip => this.calculateBusy(trip));
    // console.log(possibleTimes);
    const minTime = Math.min(...possibleTimes);
    // console.log('minTime', minTime);
    const minTimeIndex = possibleTimes.indexOf(minTime);
    // console.log('minTimeIndex', minTimeIndex);
    this.trip = pool[minTimeIndex];
    // console.log('this.trip', this.trip);
    pool.splice(minTimeIndex, 1) //= [...pool.slice(0, minTimeIndex), ...pool.slice(minTimeIndex + 1, pool.length)];
    // console.log('new pool', pool);
    this.tripsLog.push(this.trip);
    // console.log('this.tripsLog', this.tripsLog);
    // console.log('busy', this.busy);
    // console.log('first', this.calculateDistance(this.position, this.trip.start));    
    // console.log('second', calculateTime(this.trip.early));    
    // console.log('third', this.calculateDistance(this.trip.start, this.trip.end)); 
    this.busy = possibleTimes[minTimeIndex];
    // console.log('this.busy', this.busy);
}

function move() {
    this.busy--;
}

function print() {
    return this.tripsLog.length + ' ' + this.tripsLog.map( trip => trip.index).join(' ');
}

function isFinished() {
    // console.log(!this.calculateDistance(this.position, this.trip.end) ? 'finished' : 'not finished');
    return !this.calculateDistance(this.position, this.trip.end);
}

function calculateDistance(position, end) {
    return Math.abs(position.x - end.x) + Math.abs(position.y - end.y);
}

module.exports = hashcode;
