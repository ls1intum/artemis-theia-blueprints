/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { WindowService } from '@theia/core/lib/browser/window/window-service';
import * as React from 'react';

export interface ExternalBrowserLinkProps {
    text: string;
    url: string;
    windowService: WindowService;
}

function BrowserLink(props: ExternalBrowserLinkProps): JSX.Element {
    return <a
        role={'button'}
        tabIndex={0}
        href={props.url}
        target='_blank'
        >
        {props.text}
    </a>;
}

export function renderWhatIs(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            What is this?
        </h3>
        <div>
            This is the Artemis Online IDE based on the Eclipse Theia IDE. The Eclipse Theia IDE is a modern and open IDE for cloud and desktop, that is based on the <BrowserLink text="Theia platform"
            url="https://theia-ide.org" windowService={windowService} ></BrowserLink>.
        </div>
    </div>;
}


export function renderTickets(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Reporting feature requests and bugs
        </h3>
        <div>
            The Artemis Online IDE is an open source project and we welcome your feedback.
            For feature requests and bug reports, <BrowserLink text="open an issue on Github" url="https://github.com/eclipse-theia/theia-ide/issues/new/choose"
                windowService={windowService} ></BrowserLink> to let us know.
        </div>
    </div>;
}
