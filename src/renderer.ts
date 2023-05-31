//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

import './index.scss';

import { Menu } from './menu/menu';

const container = document.getElementById('menu-container');
const menu = new Menu(container);

menu.on('cancel', () => {
  document.querySelector('body').classList.add('hidden');
  window.api.hideWindow(150);
  menu.hide();
});

menu.on('select', () => {
  document.querySelector('body').classList.add('hidden');
  window.api.hideWindow(300);
  menu.hide();
});

menu.on('move-pointer', (pos) => {
  window.api.movePointer(pos);
});

document.querySelector('#show-editor-button').addEventListener('click', () => {
  document.querySelector('#show-editor-button').classList.add('hidden');
  document.querySelector('#editor-left').classList.remove('hidden');
});

document.querySelector('#hide-editor-button').addEventListener('click', () => {
  document.querySelector('#show-editor-button').classList.remove('hidden');
  document.querySelector('#editor-left').classList.add('hidden');
});

document.querySelector('#dev-tools-button').addEventListener('click', () => {
  window.api.showDevTools();
});

document.querySelector('#shortcut-button').addEventListener('click', () => {
  window.api.simulateShortcut();
});

document.addEventListener('keyup', (ev) => {
  if (ev.key === 'Escape') {
    document.querySelector('body').classList.add('hidden');
    window.api.hideWindow(150);
    menu.hide();
  }
});

window.api.showMenu((pos) => {
  document.querySelector('body').classList.remove('hidden');
  menu.show(pos);
});

window.api.log("Successfully loaded Kando's renderer process.");
