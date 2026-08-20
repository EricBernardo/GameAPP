import { clamp } from "./utils.js";

export class InputController {
  constructor() {
    this.moveX = 0;
    this.moveY = 0;
    this.dashRequested = false;

    this._keys = new Set();
    this._joystickActive = false;
    this._joystickId = null;

    this._bindKeyboard();
    this._bindJoystick();
    this._bindDashButton();
  }

  consumeDash() {
    const requested = this.dashRequested;
    this.dashRequested = false;
    return requested;
  }

  _bindKeyboard() {
    window.addEventListener("keydown", (e) => {
      this._keys.add(e.code);
      if (e.code === "Space") this.dashRequested = true;
    });
    window.addEventListener("keyup", (e) => this._keys.delete(e.code));
  }

  _keyboardVector() {
    let x = 0;
    let y = 0;
    if (this._keys.has("ArrowLeft") || this._keys.has("KeyA")) x -= 1;
    if (this._keys.has("ArrowRight") || this._keys.has("KeyD")) x += 1;
    if (this._keys.has("ArrowUp") || this._keys.has("KeyW")) y -= 1;
    if (this._keys.has("ArrowDown") || this._keys.has("KeyS")) y += 1;
    return { x, y };
  }

  _bindJoystick() {
    const zone = document.getElementById("joystick-zone");
    const base = document.getElementById("joystick-base");
    const stick = document.getElementById("joystick-stick");
    const maxRadius = 40;

    const setStick = (dx, dy) => {
      stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };

    const start = (clientX, clientY, id) => {
      this._joystickActive = true;
      this._joystickId = id;
      this._origin = { x: clientX, y: clientY };
    };

    const move = (clientX, clientY) => {
      if (!this._joystickActive) return;
      let dx = clientX - this._origin.x;
      let dy = clientY - this._origin.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }
      setStick(dx, dy);
      this.moveX = clamp(dx / maxRadius, -1, 1);
      this.moveY = clamp(dy / maxRadius, -1, 1);
    };

    const end = () => {
      this._joystickActive = false;
      this._joystickId = null;
      this.moveX = 0;
      this.moveY = 0;
      setStick(0, 0);
    };

    zone.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      start(t.clientX, t.clientY, t.identifier);
      e.preventDefault();
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._joystickId) move(t.clientX, t.clientY);
      }
    }, { passive: false });

    window.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._joystickId) end();
      }
    });

    zone.addEventListener("mousedown", (e) => {
      start(e.clientX, e.clientY, "mouse");
    });
    window.addEventListener("mousemove", (e) => {
      if (this._joystickId === "mouse") move(e.clientX, e.clientY);
    });
    window.addEventListener("mouseup", () => {
      if (this._joystickId === "mouse") end();
    });

    void base;
  }

  _bindDashButton() {
    const btn = document.getElementById("dash-btn");
    const trigger = (e) => {
      e.preventDefault();
      this.dashRequested = true;
      btn.classList.add("pressed");
      setTimeout(() => btn.classList.remove("pressed"), 120);
    };
    btn.addEventListener("touchstart", trigger, { passive: false });
    btn.addEventListener("mousedown", trigger);
  }

  update() {
    const kb = this._keyboardVector();
    if (kb.x !== 0 || kb.y !== 0) {
      const len = Math.hypot(kb.x, kb.y) || 1;
      this.moveX = kb.x / len;
      this.moveY = kb.y / len;
    } else if (!this._joystickActive) {
      this.moveX = 0;
      this.moveY = 0;
    }
  }
}
