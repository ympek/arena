export default interface Animation {
    id : string,
    framesTillDone: number,
    draw: () => void
};