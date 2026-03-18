# Scalyo Views Manifest

## Extracted View Components

| View | File | Original Lines | Description |
|------|------|----------------|-------------|
| LoginScreen | `login-screen.jsx` | 1971-3344 (~1373 lines) | User authentication and login interface |
| RoadmapView | `roadmap-view.jsx` | 3345-3565 (~220 lines) | 90-day roadmap planning |
| DashboardView | `dashboard-view.jsx` | 3566-4954 (~1388 lines) | Main dashboard with KPIs and overview |
| PortfolioView | `portfolio-view.jsx` | 4955-5551 (~596 lines) | Client portfolio management and account list |
| KanbanBoardView | `kanban-board-view.jsx` | 5552-5634 (~82 lines) | Kanban board component |
| TaskBoardView | `task-board-view.jsx` | 5635-5816 (~181 lines) | Task board component |
| UnifiedTaskBoard | `unified-task-board.jsx` | 5817-5905 (~88 lines) | Task management with Kanban/Sprint modes |
| PlanningView | `planning-view.jsx` | 5906-6543 (~637 lines) | Calendar and event planning |
| WellbeingView | `wellbeing-view.jsx` | 6544-8633 (~2089 lines) | Team wellbeing tracking and burnout alerts |
| ResourcesView | `resources-view.jsx` | 8634-9459 (~825 lines) | CS resources library and playbooks |
| EmailStudioView | `email-studio-view.jsx` | 9460-9684 (~224 lines) | Email template generation |
| KPIView | `k-p-i-view.jsx` | 9685-12678 (~2993 lines) | KPI tracking and reporting |
| CoachIAView | `coach-i-a-view.jsx` | 12679-13002 (~323 lines) | AI Customer Success coach chat interface |
| SettingsView | `settings-view.jsx` | 13003-13726 (~723 lines) | Application settings and preferences |
| TipsView | `tips-view.jsx` | 13727-13778 (~51 lines) | CS tips and best practices |
| QuotesView | `quotes-view.jsx` | 13779-14040 (~261 lines) | Quote generation for renewals/expansions |
| FeedbackView | `feedback-view.jsx` | 14041-15005 (~964 lines) | User feedback collection |

## Usage

```javascript
// Import individual views
import DashboardView from './views/dashboard-view.jsx';
import PortfolioView from './views/portfolio-view.jsx';

// Or import all at once
import { DashboardView, PortfolioView, SettingsView } from './views';
```

## View Dependencies

All views depend on:
- React (v18.2.0)
- Shared utilities from `../shared/`
- i18n translations from `../i18n/`
- Supabase client
