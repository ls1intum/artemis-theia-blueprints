/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import * as React from "react";

import { Message } from "@theia/core/lib/browser";
import { inject, injectable } from "@theia/core/shared/inversify";
import {
  renderTickets,
  renderWhatIs,
} from "./branding-util";

import { GettingStartedWidget } from "@theia/getting-started/lib/browser/getting-started-widget";
import { WindowService } from "@theia/core/lib/browser/window/window-service";

@injectable()
export class TheiaIDEGettingStartedWidget extends GettingStartedWidget {

  @inject(WindowService)
  protected readonly windowService: WindowService;

  protected vscodeApiVersion: string;

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
              <div className="col">
                {this.renderActions()}
              </div>
            </div>
            <div className="col col-flex">
              {/* <div className="logo-container">
                <div className="gs-logo"></div>
                <h1>/</h1>
                <div className="gs-artemis-logo"></div>
              </div> */}
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
            Artemis Online <span className="gs-blue-header">IDE</span>
          </h1>
          <h2 className="onboarding-subheader">
            Based on Eclipse Theia IDE
          </h2>
      </div>
    );
  }

}
