import {
  Directive,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Directive()
export abstract class ResourcePageLogic implements OnInit {

  moduleId!: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const modParam = this.route.snapshot.paramMap.get('modId');
    this.moduleId = Number(modParam) || 1;
  }
}
