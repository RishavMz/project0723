import World from "./Component/World";

const nearLimit = 10;
const farLimit = 10000;
const projectionAngle = 75;
const fps = 60;

const world = new World(projectionAngle, nearLimit, farLimit, fps);

world.animate();
