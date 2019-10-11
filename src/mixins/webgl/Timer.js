export default class Timer {
  /**
   * Timer is a light timer class to get current time
   * as well as elapsed from since last check.
   * @constructor
   */
  constructor(keepTime = false) {
    this.lastStartTime = this.getTrueTime(); // Last start time
    this.totalTime = 0; // Total time elapsed while not paused
    this.keepTime = keepTime; // whether timer is paused or not
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
   * resume timer
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
  getTimeSec(discardDecimal = false) {
    let s = this.getTime() / 1000;
    if (discardDecimal) {
      s = Math.floor(s);
    }
    return s;
  }

  /**
   * Get current time.
   * @return {number} current time.
   */
  getTrueTime() {
    var time = new Date();
    return time.getTime();
  }

  /**
   * Function to add time if you ever need.
   */
  addTime(timeToAddInMs) {
    this.totalTime += timeToAddInMs;
  }
}
