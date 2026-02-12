import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import {
    TabBarToolbarContribution,
    TabBarToolbarRegistry
} from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { ReactTabBarToolbarAction } from '@theia/core/lib/browser/shell/tab-bar-toolbar/tab-bar-toolbar-types';
import { Widget } from '@theia/core/lib/browser';
import { ContextMenuRenderer, Anchor } from '@theia/core/lib/browser/context-menu-renderer';
import { BrowserMenuNodeFactory } from '@theia/core/lib/browser/menu/browser-menu-node-factory';
import { Emitter, Event, MenuPath, nls } from '@theia/core';
import { EditorWidget } from '@theia/editor/lib/browser';
import { TaskService } from '@theia/task/lib/browser/task-service';
import { TaskConfigurations } from '@theia/task/lib/browser/task-configurations';
import { TaskConfigurationManager } from '@theia/task/lib/browser/task-configuration-manager';
import { TaskConfiguration } from '@theia/task/lib/common';
import { CommandMenu, MenuNode } from '@theia/core/lib/common/menu';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import * as React from '@theia/core/shared/react';
import { SplitButton } from './split-button';

export const TASK_RUN_TOOLBAR_MENU: MenuPath = ['task-toolbar', 'run'];
const TASK_REFRESH_DELAY_MS = 600;

@injectable()
export class TaskToolbarContribution implements TabBarToolbarContribution {
    @inject(TaskService)
    protected readonly taskService: TaskService;
    @inject(TaskConfigurations)
    protected readonly taskConfigurations: TaskConfigurations;
    @inject(TaskConfigurationManager)
    protected readonly taskConfigurationManager: TaskConfigurationManager;
    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;
    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;
    @inject(BrowserMenuNodeFactory)
    protected readonly menuNodeFactory: BrowserMenuNodeFactory;

    protected readonly onDidChangeEmitter = new Emitter<void>();
    protected readonly onDidChange: Event<void> = this.onDidChangeEmitter.event;

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

    registerToolbarItems(registry: TabBarToolbarRegistry): void {
        registry.registerItem(this.createToolbarItem());
    }

    protected createToolbarItem(): ReactTabBarToolbarAction {
        return {
            id: 'task-run-toolbar-button',
            group: 'navigation',
            priority: 0,
            onDidChange: this.onDidChange,
            isVisible: (widget?: Widget) => widget instanceof EditorWidget,
            render: (widget?: Widget) => this.render(widget)
        };
    }

    protected async initializeTasks(): Promise<void> {
        await this.workspaceService.ready;
        const roots = await this.workspaceService.roots;
        if (!roots || roots.length === 0) {
            return;
        }
        await this.refreshTasks();
    }

    /**
     * Refresh the cached tasks list and notify listeners.
     * A new token is requested each time to ensure fresh data from task providers.
     */
    protected async refreshTasks(): Promise<void> {
        // delay to refresh after workspace debounce
        await new Promise(resolve => setTimeout(resolve, TASK_REFRESH_DELAY_MS));
        try {
            const token = this.taskService.startUserAction();
            this.cachedTasks = await this.taskConfigurations.getTasks(token);
        } catch (error) {
            console.error('Failed to refresh tasks:', error);
            this.cachedTasks = [];
        }
        this.onDidChangeEmitter.fire();
    }

    /**
     * Get the task that should be executed when clicking the main button.
     * Priority: Last executed task > First task in list
     */
    protected getTaskToRun(): TaskConfiguration | undefined {
        const lastTaskInfo = this.taskService.getLastTask();
        if (lastTaskInfo.resolvedTask) {
            const lastTaskLabel = lastTaskInfo.resolvedTask.label;
            const matchingTask = this.cachedTasks.find(t => t.label === lastTaskLabel);
            if (matchingTask) {
                return matchingTask;
            }
        }

        if (this.cachedTasks.length > 0) {
            return this.cachedTasks[0];
        }

        return undefined;
    }

    protected render(widget?: Widget): React.ReactNode {
        const hasTasks = this.cachedTasks.length > 0;
        const taskToRun = this.getTaskToRun();

        return (
            <SplitButton
                buttonKey="task-run-toolbar-button"
                icon="play"
                tooltip={this.getTooltip(taskToRun, hasTasks)}
                menuTooltip={nls.localize('theia/task/selectTask', 'Select task to run')}
                enabled={hasTasks}
                showMenu={hasTasks}
                onRun={e => this.handleRunTask(e)}
                onShowMenu={e => this.handleShowAllTasks(e, widget)}
            />
        );
    }

    protected getTooltip(taskToRun: TaskConfiguration | undefined, hasTasks: boolean): string {
        if (!hasTasks) {
            return nls.localize('theia/task-toolbar/noTasks', 'No tasks available');
        }
        if (taskToRun) {
            return nls.localize('theia/task-toolbar/runTask', 'Run Task: {0}', taskToRun.label);
        }
        return nls.localize('theia/task-toolbar/runTask', 'Run Task');
    }

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
        const menuGroups = this.buildTaskMenu();
        const anchor: Anchor = { x: e.clientX, y: e.clientY };
        this.contextMenuRenderer.render({
            menuPath: TASK_RUN_TOOLBAR_MENU,
            menu: {
                children: menuGroups,
                isEmpty: () => menuGroups.length === 0,
                isVisible: () => true,
                id: 'task-run-toolbar-menu-groups',
                sortString: '0'
            },
            anchor,
            args: [widget],
            context: e.currentTarget
        });
    }

    protected buildTaskMenu(): MenuNode[] {
        // const menu = new GroupImpl(TASK_RUN_TOOLBAR_MENU[0]);
        const menu: MenuNode[] = [];
        const menuGroup = this.menuNodeFactory.createGroup('default');
        for (const task of this.cachedTasks) {
            menuGroup.addNode(this.createTaskMenuNode(task));
        }
        menu.push(menuGroup);
        return menu;
    }

    protected createTaskMenuNode(task: TaskConfiguration): MenuNode {
        const taskLabel = task.label;

        const customNode: CommandMenu = {
            id: `task-run-${taskLabel}`,
            sortString: taskLabel,
            label: taskLabel,
            icon: undefined,
            isVisible: () => true,
            isEnabled: () => true,
            isToggled: () => false,
            run: async () => {
                await this.taskService.runTaskByLabel(
                    this.taskService.startUserAction(),
                    taskLabel
                );
            }
        };
        return customNode;
    }
}
