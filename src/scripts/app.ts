// app.ts

import { Model } from './model';
import { View } from './view';
import { Controller } from './controller';

declare global {
   var model: Model;
   var view: View;
   var controller: Controller;
}


window.model = new Model();
window.view = new View();
window.controller = new Controller();