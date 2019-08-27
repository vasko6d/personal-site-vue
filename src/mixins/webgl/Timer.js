export default class Timer {
  /**
   * Timer is a light timer class to get current time
   * as well as elapsed from since last check.
   * @constructor
   */
  constructor() {
    this.prevTime = 0; //the previously recorded time
    this.nowTime = 0; //current time
    this.reset();
  }

  /**
   * Set the previous time to current time;
   */
  reset() {
    this.prevTime = this.getNowTime();
    this.nowTime = this.prevTime;
  }

  /**
   * Get current time.
   * @return {number} current time.
   */
  getNowTime = function() {
    var time = new Date();
    return time.getTime();
  };

  /**
   * Get passed time since last time this function
   * get called or since the reset() if first time
   * called.
   * @return {number} dt
   */
  getElapsedTime = function() {
    var dt = this.getNowTime() - this.prevTime;
    this.prevTime += dt;
    return dt;
  };
}
