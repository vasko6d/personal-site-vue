export default class Timer {
  /**
   * Timer is a light timer class to get current time
   * as well as elapsed from since last check.
   * @constructor
   */
  constructor() {
    this.lastStartTime = this.getTrueTime(); // Last start time
    this.totalTime = 0; // Total time elapsed while not paused
    this.keepTime = false; // whether timer is paused or not
  }

  /**
   * pause timer
   */
  pause() {
    if (this.keepTime) {
      this.totalTime += this.getTrueTime() - this.lastStartTime;
    }
    this.keepTime = false;
  }

  /**
   * pause timer
   */
  resume() {
    if (!this.keepTime) {
      this.lastStartTime = this.getTrueTime();
    }
    this.keepTime = true;
  }

  /**
   * reset timer
   */
  reset() {
    this.totalTime = 0;
    this.keepTime = false;
    this.lastStartTime = this.getTrueTime();
  }

  /**
   * toggle time keeping
   */
  toggleTimer() {
    if (this.keepTime) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * is the timer active?
   */
  isActive() {
    return this.keepTime;
  }

  /**
   * get the non-paused time since timer was started
   * @return {number} current time.
   */
  getTime() {
    if (this.keepTime) {
      this.pause();
      this.resume();
    }
    return this.totalTime;
  }

  /**
   * get the non-paused time since timer was started
   * @return {number} current time.
   */
  getTimeSec() {
    return this.getTime() / 1000;
  }

  /**
   * Get current time.
   * @return {number} current time.
   */
  getTrueTime = function() {
    var time = new Date();
    return time.getTime();
  };
}
