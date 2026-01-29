// *****************************************************************************
// Copyright (C) 2025 and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import {
    TabBarToolbarContribution,
    TabBarToolbarRegistry
} from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { ReactTabBarToolbarAction } from '@theia/core/lib/browser/shell/tab-bar-toolbar/tab-bar-toolbar-types';
import { codicon, Widget } from '@theia/core/lib/browser';
import { ContextMenuRenderer, Anchor } from '@theia/core/lib/browser/context-menu-renderer';
import { Emitter, Event, MenuPath, nls } from '@theia/core';
import { EditorWidget } from '@theia/editor/lib/browser';
import { TaskService } from '@theia/task/lib/browser/task-service';
import { TaskConfigurations } from '@theia/task/lib/browser/task-configurations';
import { TaskConfigurationManager } from '@theia/task/lib/browser/task-configuration-manager';
import { TaskConfiguration } from '@theia/task/lib/common';
import { CommandRegistry } from '@theia/core/lib/common';
import { ActionMenuNode, GroupImpl, MenuNode } from '@theia/core/lib/common/menu';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import * as React from '@theia/core/shared/react';
import '../../../src/browser/toolbar/task-toolbar-contribution.css';

/**
 * Menu path for the task run dropdown
 */
export const TASK_RUN_TOOLBAR_MENU: MenuPath = ['task-toolbar', 'run'];
@injectable()
export class TaskToolbarContribution implements TabBarToolbarContribution {
    @inject(TaskService)
    protected readonly taskService: TaskService;
    @inject(TaskConfigurations)
    protected readonly taskConfigurations: TaskConfigurations;
    @inject(TaskConfigurationManager)
    protected readonly taskConfigurationManager: TaskConfigurationManager;
    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;
    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;
    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;
    protected readonly onDidChangeEmitter = new Emitter<void>();
    protected readonly onDidChange: Event<void> = this.onDidChangeEmitter.event;
    /**
     * Cached list of available tasks
     */
    protected cachedTasks: TaskConfiguration[] = [];
    @postConstruct()
    protected init(): void {
        this.taskConfigurationManager.onDidChangeTaskConfig(() => {
            this.refreshTasks();
        });

        this.workspaceService.onWorkspaceChanged(async () => {
            await this.workspaceService.ready;
            this.refreshTasks();
        });

        this.initializeTasks();
    }

    protected async initializeTasks(): Promise<void> {
        // Wait for workspace roots to be available first
        const roots = await this.workspaceService.roots;
        if (!roots || roots.length === 0) {
            console.log('No workspace roots available yet, will rely on onWorkspaceChanged event');
            return;
        }

        // wait for workspace to be ready
        await this.workspaceService.ready;
        await this.refreshTasks();
    }

    /**
     * Refresh the cached tasks list and notify listeners.
     * A new token is requested each time to ensure fresh data from task providers.
     */
    protected async refreshTasks(): Promise<void> {
        // delay to refresh after workspace debounce
        await new Promise(resolve => setTimeout(resolve, 600));
        try {
            const token = this.taskService.startUserAction();
            this.cachedTasks = await this.taskConfigurations.getTasks(token);
        } catch (error) {
            console.error('Failed to refresh tasks:', error);
            this.cachedTasks = [];
        }
        this.onDidChangeEmitter.fire();
    }

    registerToolbarItems(registry: TabBarToolbarRegistry): void {
        registry.registerItem(this.createTaskRunToolbarItem());
    }

    /**
     * Create the React-based toolbar item for running tasks
     */
    protected createTaskRunToolbarItem(): ReactTabBarToolbarAction {
        return {
            id: 'task-run-toolbar-button',
            group: 'navigation',
            priority: 0, // After "Run or Debug..." button (priority 1)
            onDidChange: this.onDidChange,
            isVisible: (widget?: Widget) => this.isEditorWidget(widget),
            render: (widget?: Widget) => this.renderSplitButton(widget)
        };
    }

    /**
     * Check if the widget is an editor widget
     */
    protected isEditorWidget(widget?: Widget): boolean {
        return widget instanceof EditorWidget;
    }

    /**
     * Get the task that should be executed when clicking the main button.
     * Priority: Last executed task > First task in list
     */
    protected getTaskToRun(): TaskConfiguration | undefined {
        // Priority 1: Last executed task (if still available)
        const lastTaskInfo = this.taskService.getLastTask();
        if (lastTaskInfo.resolvedTask) {
            const lastTaskLabel = lastTaskInfo.resolvedTask.label;
            const matchingTask = this.cachedTasks.find(t => t.label === lastTaskLabel);
            if (matchingTask) {
                return matchingTask;
            }
        }
        
        // Priority 2: First task from tasks.json
        if (this.cachedTasks.length > 0) {
            return this.cachedTasks[0];
        }
        
        return undefined;
    }

    /**
     * Render the split button component
     */
    protected renderSplitButton(widget?: Widget): React.ReactNode {
        const hasTasks = this.cachedTasks.length > 0;
        const taskToRun = this.getTaskToRun();
        
        const tooltip = this.getTooltip(taskToRun, hasTasks);
        const isEnabled = hasTasks;
        
        const containerClasses = [
            'task-run-split-button',
            'theia-tab-bar-toolbar-item',
            isEnabled ? 'enabled' : 'disabled',
            hasTasks ? 'menu' : ''
        ].filter(Boolean).join(' ');

        const runButtonClasses = [
            codicon('play'),
            'action-item',
            'run-button'
        ].join(' ');

        return (
            <div key="task-run-toolbar-button" className={containerClasses}>
                <button
                    className={runButtonClasses}
                    title={tooltip}
                    onClick={e => this.handleRunTask(e)}
                    disabled={!isEnabled}
                />
                
                {hasTasks && (
                    <>
                        <button
                            className="action-item chevron-button"
                            onClick={e => this.handleShowAllTasks(e, widget)}
                            title={nls.localize('theia/task/selectTask', 'Select task to run')}
                        >
                            <span className={`${codicon('chevron-down')} chevron`} />
                        </button>
                    </>
                )}
            </div>
        );
    }

    /**
     * Generate tooltip text based on current state
     */
    protected getTooltip(taskToRun: TaskConfiguration | undefined, hasTasks: boolean): string {
        if (!hasTasks) {
            return nls.localize('theia/task-toolbar/noTasks', 'No tasks available');
        }
        if (taskToRun) {
            return nls.localize('theia/task-toolbar/runTask', 'Run Task: {0}', taskToRun.label);
        }
        return nls.localize('theia/task-toolbar/runTask', 'Run Task');
    }

    /**
     * runs last task if available, otherwise the first task
     */
    protected async handleRunTask(e: React.MouseEvent<HTMLElement>): Promise<void> {
        e.preventDefault();
        e.stopPropagation();
        const taskToRun = this.getTaskToRun();
        if (!taskToRun) {
            return;
        }
        const token = this.taskService.startUserAction(); 
        await this.taskService.runTaskByLabel(token, taskToRun.label);
    }
    protected handleShowAllTasks(e: React.MouseEvent<HTMLElement>, widget?: Widget): void {
        e.preventDefault();
        e.stopPropagation();
        if (this.cachedTasks.length === 0) {
            return;
        }
        const menu = this.buildTaskMenu();
        const anchor: Anchor = { x: e.clientX, y: e.clientY };
        this.contextMenuRenderer.render({
            menuPath: TASK_RUN_TOOLBAR_MENU,
            menu,
            anchor,
            args: [widget],
            context: e.currentTarget
        });
    }
    /**
     * Build a dynamic menu with all available tasks
     */
    protected buildTaskMenu(): GroupImpl {
        const menu = new GroupImpl(TASK_RUN_TOOLBAR_MENU[0]);
        for (const task of this.cachedTasks) {
            const menuNode = this.createTaskMenuNode(task);
            menu.addNode(menuNode);
        }
        return menu;
    }
    /**
     * Create a menu node for a single task
     */
    protected createTaskMenuNode(task: TaskConfiguration): MenuNode {
        const taskLabel = task.label;
        const taskService = this.taskService;
        
        // Create a custom menu node that runs the task
        return {
            id: `task-run-${taskLabel}`,
            label: taskLabel,
            sortString: taskLabel,
            // icon: codicon('play'),
            isVisible: () => true,
            isEnabled: () => true,
            isToggled: () => false,
            run: async (): Promise<void> => {
                const token = taskService.startUserAction();
                await taskService.runTaskByLabel(token, taskLabel);
            }
        } as unknown as ActionMenuNode;
    }
}