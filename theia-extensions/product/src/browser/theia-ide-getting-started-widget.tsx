/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import * as React from "react";

import { codicon, Message } from "@theia/core/lib/browser";
import { inject, injectable } from "@theia/core/shared/inversify";
import {
  renderTickets,
  renderWhatIs,
} from "./branding-util";

import { GettingStartedWidget } from "@theia/getting-started/lib/browser/getting-started-widget";
import { WindowService } from "@theia/core/lib/browser/window/window-service";
import { environment, isOSX, nls } from "@theia/core";

@injectable()
export class TheiaIDEGettingStartedWidget extends GettingStartedWidget {

  @inject(WindowService)
  protected readonly windowService: WindowService;

  protected async doInit(): Promise<void> {
    super.doInit();
    this.update();
  }

  protected onActivateRequest(msg: Message): void {
    super.onActivateRequest(msg);
    const htmlElement = document.getElementById("alwaysShowWelcomePage");
    if (htmlElement) {
      htmlElement.focus();
    }
  }

  protected render(): React.ReactNode {
    return (
      <div className="gs-container">
        <div className="gs-content-container gs-content-centered">
          <hr className="gs-hr" />
          <div className="flex-grid">
            <div className="col">
              {this.renderHeader()}
              <div>
                {this.renderActions()}
              </div>
            </div>
            <div className="col col-flex">
              {renderWhatIs(this.windowService)}
              {renderTickets(this.windowService)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  protected renderActions(): React.ReactNode {
    return (
      <div className="gs-container">
        <div className="flex-grid">
          <div className="col">{this.renderStart()}</div>
        </div>
        <div className="flex-grid">
          <div className="col">{this.renderSettings()}</div>
        </div>
      </div>
    );
  }

  protected renderHeader(): React.ReactNode {
    return (
      <div className="header-container">
          <h1 className="onboarding-header">
            Artemis <span className="gs-blue-header">Online IDE</span>
          </h1>
          <h2 className="onboarding-subheader">
            Based on Eclipse Theia IDE
          </h2>
      </div>
    );
  }

    /**
     * Render the `Start` section.
     * Displays a collection of "start-to-work" related commands like `open` commands and some other.
     */
  protected override renderStart(): React.ReactNode {
      const requireSingleOpen = isOSX || !environment.electron.is();
      const openFileExplorer = requireSingleOpen && <div className='gs-action-container'>
          <a
              role={'button'}
              tabIndex={0}
              onClick={this.doOpenExplorer}
              onKeyDown={this.doOpenExplorerEnter}>
              {nls.localizeByDefault('Open Exercise in Explorer View')}
          </a>
      </div>;
      const openSourceControl = requireSingleOpen && <div className='gs-action-container'>
          <a
              role={'button'}
              tabIndex={0}
              onClick={this.doOpenScm}
              onKeyDown={this.doOpenScmEnter}>
              {nls.localizeByDefault('Open Source Control View')}
          </a>
      </div>;
      const showAllTerminals = requireSingleOpen && <div className='gs-action-container'>
          <a
              role={'button'}
              tabIndex={0}
              onClick={this.doToggleTermials}
              onKeyDown={this.doToggleTermialsEnter}>
              {nls.localizeByDefault('Open Terminal View')}
          </a>
      </div>;

      return <div className='gs-section'>
          <h3 className='gs-section-header'><i className={codicon('folder-opened')}></i>{nls.localizeByDefault('Start')}</h3>
          {openFileExplorer}
          {openSourceControl}
          {showAllTerminals}
      </div>;
  }

  /**
  * Trigger the view explorer command.
  */
  protected doOpenExplorer = () => this.commandRegistry.executeCommand('workbench.view.explorer');
  protected doOpenExplorerEnter = (e: React.KeyboardEvent) => {
      if (this.isEnterKey(e)) {
          this.doOpenExplorer();
      }
  };
  protected test = () => {
    console.log('start listing all commands')
    const iterator = this.commandRegistry.getAllCommands();
    for (let out = iterator.next(); !out.done; out = iterator.next()) {
      console.log('command', out.value);
    }
    console.log('finish listing all commands')
  }

  /**
  * Trigger the view source control manager command.
  */
  protected doOpenScm = () => this.commandRegistry.executeCommand('scmView:toggle');
  protected doOpenScmEnter = (e: React.KeyboardEvent) => {
    if (this.isEnterKey(e)) {
        this.doOpenScm();
    }
  };

  /**
  * Trigger the toggle terminal command.
  */
  protected doToggleTermials = () => this.commandRegistry.executeCommand('workbench.action.terminal.toggleTerminal');
  protected doToggleTermialsEnter = (e: React.KeyboardEvent) => {
      if (this.isEnterKey(e)) {
          this.doToggleTermials();
      }
  }
}
