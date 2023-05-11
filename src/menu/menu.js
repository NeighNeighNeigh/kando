//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
//     |  /  __|   \ |       _ \   _ \     This file belongs to Ken-Do,                 //
//     . <   _|   .  | ____| |  | (   |    the open-source cross-platform pie menu.     //
//    _|\_\ ___| _|\_|      ___/ \___/     Read more on github.com/ken-do-menu/ken-do   //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

import './menu.scss';
import './theme.scss';

const {computeItemAngles} = require('./math.js');

const CHILDREN_PER_LEVEL = [8, 5, 3, 3];

export default class Menu {

  _container    = null;
  _root         = null;
  _selectedItem = [];

  _menuPosition  = {x: 0, y: 0};
  _mousePosition = {x: 0, y: 0};
  _mouseAngle    = 0;
  _mouseDistance = 0;

  constructor() {
    window.api.log('Menu constructor');

    this._container = document.getElementById('menu');

    this._container.addEventListener('mousemove', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this._root) {
        this._mousePosition.x = e.clientX - this._menuPosition.x;
        this._mousePosition.y = e.clientY - this._menuPosition.y;

        this._mouseDistance = Math.sqrt(this._mousePosition.x * this._mousePosition.x +
                                        this._mousePosition.y * this._mousePosition.y);
        this._mouseAngle =
          Math.acos(this._mousePosition.x / this._mouseDistance) * 180 / Math.PI;

        if (this._mousePosition.y < 0) {
          this._mouseAngle = 360 - this._mouseAngle;
        }

        // Turn 0° up.
        this._mouseAngle = (this._mouseAngle + 90) % 360;

        this._redraw(this._root, 0);
      }
    });
  }

  show(position) {
    window.api.log(`Menu show at ${position.x}, ${position.y}`);

    this._menuPosition = position;
    this._root         = {name: 'Root'};

    const addChildren = (parent, level) => {
      if (level < CHILDREN_PER_LEVEL.length) {
        parent.children = [];
        for (let i = 0; i < CHILDREN_PER_LEVEL[level]; ++i) {
          const node = {
            name: `Item-${level}-${i}`,
            icon: 'edit',
          };
          parent.children.push(node);
          addChildren(node, level + 1);
        }
      }
    };

    addChildren(this._root, 0);

    // Multiply all number in CHILDREN_PER_LEVEL by each other.
    const count = CHILDREN_PER_LEVEL.reduce((a, b) => a * b, 1);
    window.api.log(`Created ${count} children!`);

    this._setupAngles(this._root);
    this._createNodeTree(this._root, this._container);

    this._redraw(this._root, 0);
    this._root.div.classList.add('active');

    this._root.div.style.transform =
      `translate(${this._menuPosition.x}px, ${this._menuPosition.y}px)`;
  }

  hide() {
    window.api.log('Menu hide');

    this._container.innerHTML = '';
    this._root                = null;
  }

  // --------------------------------------------------------------------- private methods

  _createNodeTree(node, container) {
    node.div = document.createElement('div');
    node.div.classList.add('node');

    const item = document.createElement('div');
    item.classList.add('item');

    container.appendChild(node.div);
    node.div.appendChild(item);

    if (node.children) {
      for (const child of node.children) {
        this._createNodeTree(child, node.div);
      }
    }
  }

  _redraw(node, level) {

    if (level > 2) {
      return;
    }

    if (level === 0) {

      if (this._mouseDistance > 50) {
        node.div.classList.remove('hover');
      } else {
        node.div.classList.add('hover');
      }

    } else if (level === 1) {
      let transform = '';
      let hovered   = false;

      if (this._mouseDistance > 50) {
        hovered =
          ((this._mouseAngle > node.startAngle && this._mouseAngle <= node.endAngle) ||
           (this._mouseAngle - 360 > node.startAngle &&
            this._mouseAngle - 360 <= node.endAngle));

        const angleDiff = Math.abs(node.angle - this._mouseAngle);
        let scale       = 1.0 + 0.15 * Math.pow(1 - angleDiff / 180, 4.0);

        if (hovered) {
          scale += 0.05;
        }

        transform = `scale(${scale}) `;
      }


      if (hovered) {
        node.div.classList.add('hover');
      } else {
        node.div.classList.remove('hover');
      }

      transform += `translate(${100 * Math.cos((node.angle - 90) * Math.PI / 180)}px, ${
        100 * Math.sin((node.angle - 90) * Math.PI / 180)}px)`;
      node.div.style.transform = transform;

    } else if (level === 2) {
      node.div.style.transform =
        `translate(${25 * Math.cos((node.angle - 90) * Math.PI / 180)}px, ${
          25 * Math.sin((node.angle - 90) * Math.PI / 180)}px)`;
    }

    for (const child of node.children) {
      this._redraw(child, level + 1);
    }
  }

  _setupAngles(node) {

    if (!node.children || node.children.length === 0) {
      return;
    }

    const angles = computeItemAngles(node.children, (node.angle + 180) % 360);

    for (let i = 0; i < node.children.length; ++i) {
      let previousAngle = angles[(i - 1 + angles.length) % angles.length];
      let nextAngle     = angles[(i + 1) % angles.length];

      // Make sure we wrap around.
      if (nextAngle < previousAngle) {
        nextAngle += 360;
      }

      if (angles[i] < previousAngle) {
        nextAngle -= 360;
        previousAngle -= 360;
      }

      const child      = node.children[i];
      child.angle      = angles[i];
      child.startAngle = (child.angle + previousAngle) / 2;
      child.endAngle   = (child.angle + nextAngle) / 2;
      this._setupAngles(child);
    }
  }
}