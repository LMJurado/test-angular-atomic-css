import { Component, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.html',
  styleUrl: './tabs.css'
})
export class Tabs {
  tabs = input.required<TabItem[]>();
  activeTab = input.required<string>();
  tabChange = output<string>();

  selectTab(id: string) {
    if (id !== this.activeTab()) this.tabChange.emit(id);
  }
}