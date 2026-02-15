// Events
export enum EventStatus {
    UPCOMING = 'UPCOMING',
    LIVE = 'LIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum RSVPStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    TENTATIVE = 'TENTATIVE',
}

export interface EventCreate {
    name: string;
    date_time: string; // ISO string
    meeting_link: string;
    event_type?: string;
    status?: EventStatus;
    agenda?: string;
    organizer_id?: string; // Allow specifying organizer
    end_time?: string;
    timezone?: string;
    has_awards?: boolean;
    voting_required?: boolean;
    award_categories?: string;
}

export type EventUpdate = Partial<EventCreate>;

export interface EventStatusUpdate {
    status: EventStatus;
}

export interface ParticipantCreate {
    user_id: string;
    rsvp_status?: RSVPStatus;
}

export interface ParticipantResponse {
    id: string;
    user_id: string;
    user_name: string;
    rsvp_status: RSVPStatus;
    attended: boolean;
}

export interface VoteCreate {
    event_id: string;
    nominee_id: string;
    award_category: string;
    reason?: string;
}

export interface VoteCount {
    nominee_id: string;
    nominee_name: string;
    nominee_avatar: string;
    award_category: string;
    count: number;
}

export interface RiskItem {
    component: string;
    risk_score: number;
    defect_count: number;
}

// Search
export enum SearchResultType {
    RELEASE = "RELEASE",
    WORK_ITEM = "WORK_ITEM",
    TASK = "TASK",
    EVENT = "EVENT",
    USER = "USER"
}

export interface SearchResult {
    id: string;
    title: string;
    type: SearchResultType;
    subtitle?: string;
    url: string;
}

export interface Event {
    id: string;
    name: string;
    date_time: string;
    meeting_link: string;
    event_type?: string;
    status: EventStatus;
    agenda?: string;
    organizer_id: string;
    organizer_name: string;
    created_at: string;
    end_time?: string;
    timezone?: string;
    has_awards?: boolean;
    voting_required?: boolean;
    award_categories?: string;
}

export interface EventDetailResponse extends Event {
    participants: ParticipantResponse[];
    endorsements: EndorsementSummary[];
}

export interface EventReleaseLink {
    release_id: string;
    relationship_type: string;
}

export interface EventListItem extends Event {
    participant_count?: number;
}

// Endorsements
export interface EndorsementCreate {
    receiver_id: string;
    category: string;
    message: string;
    project_id?: string;
    event_id?: string;
    skills?: string; // JSON string or comma-separated
}

export interface EndorsementResponse {
    id: string;
    receiver_id: string;
    category: string;
    message: string;
    project_id?: string;
    event_id?: string;
    skills?: string;
    giver_id: string;
    giver_name: string;
    receiver_name: string;
    giver_avatar?: string;
    receiver_avatar?: string;
    giver_team?: string;
    receiver_team?: string;
    event_name?: string;
    created_at: string;
    likes: number;
    comments: number;
    liked_by_user: boolean;
}

export interface EndorsementSummary {
    id: string;
    category: string;
    giver_name: string;
    created_at: string;
}

// Releases
export enum ReleaseStatus {
    PLANNING = 'PLANNING',
    DEVELOPMENT = 'DEVELOPMENT',
    TESTING = 'TESTING',
    STAGING = 'STAGING',
    PRODUCTION = 'PRODUCTION',
    COMPLETED = 'COMPLETED',
}

export interface ReleaseCreate {
    version: string;
    name?: string;
    status?: ReleaseStatus;
    start_date?: string;
    release_date?: string;
}

export interface ReleaseResponse {
    id: string;
    version: string;
    name?: string;
    status: ReleaseStatus;
    start_date?: string;
    release_date?: string;
    actual_release_date?: string;
    completion_percentage: number;
    health_score: number;
    created_at: string;
}

// Work Items
export enum WorkItemType {
    FEATURE = 'FEATURE',
    BUG = 'BUG',
    TASK = 'TASK',
    IMPROVEMENT = 'IMPROVEMENT',
}

export enum WorkItemStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    TESTING = 'TESTING',
    DONE = 'DONE',
}

export interface WorkItemCreate {
    title: string;
    description?: string;
    type?: WorkItemType;
    status?: WorkItemStatus;
    priority?: string;
    story_points?: number;
    release_id?: string;
    assignee_id?: string;
    team_id?: string;
}

export interface WorkItemResponse {
    id: string;
    title: string;
    description?: string;
    type: WorkItemType;
    status: WorkItemStatus;
    priority: string;
    story_points?: number;
    release_id?: string;
    assignee_id?: string;
    team_id?: string;
    created_at: string;
}

// Testing
export enum TestCycleStatus {
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ABORTED = 'ABORTED',
}

export enum TestExecutionStatus {
    PASS = 'PASS',
    FAIL = 'FAIL',
    BLOCKED = 'BLOCKED',
    SKIPPED = 'SKIPPED',
    PENDING = 'PENDING',
}

export interface TestExecutionCreate {
    cycle_id: string;
    title: string;
    status?: TestExecutionStatus;
    comments?: string;
    defect_id?: string;
}

export interface TestExecutionResponse {
    id: string;
    cycle_id: string;
    title: string;
    status: TestExecutionStatus;
    executed_by_id?: string;
    executed_at?: string;
    comments?: string;
    defect_id?: string;
    created_at: string;
}
// Forced recompile

export interface TestingCycleCreate {
    name: string;
    status?: TestCycleStatus;
    start_date?: string;
    end_date?: string;
    release_id: string;
}

export interface TestingCycleResponse {
    id: string;
    name: string;
    status: TestCycleStatus;
    start_date?: string;
    end_date?: string;
    release_id: string;
    pass_rate: number;
    created_at: string;
}

// Analytics
export interface DashboardMetrics {
    active_releases_count: number;
    average_release_health: number;
    testing_pass_rate: number;
    items_completed_this_month: number;
}

export interface VelocityMetric {
    period: string;
    points: number;
}

// Tasks
export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export interface TaskCreate {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
    assigned_to_id?: string;
    linked_event_id?: string;
    linked_release_id?: string;
}

export interface TaskResponse {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    assigned_to_id?: string;
    created_by_id?: string;
    linked_event_id?: string;
    linked_release_id?: string;
    created_at: string;
}

// Notifications
export enum NotificationType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
    MENTION = 'MENTION',
    ASSIGNMENT = 'ASSIGNMENT',
}

export interface NotificationResponse {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    related_entity_type?: string;
    related_entity_id?: string;
    is_read: boolean;
    created_at: string;
}

export interface NotificationPreferenceResponse {
    notification_type: NotificationType;
    channel: string;
    enabled: boolean;
}

// Profiles
export interface ProfileBase {
    bio?: string;
    title?: string;
    department?: string;
    location?: string;
    skills?: string[];
    social_links?: { [key: string]: string };
}

export interface ProfileResponse extends ProfileBase {
    id: string;
    user_id: string;
    joined_at: string;
    updated_at: string;
}

export interface ProfileUpdate extends ProfileBase { }

export interface UserProfileFullResponse {
    user_id: string;
    name: string;
    role?: string;
    team?: string;
    email?: string;
    profile?: ProfileResponse;
    impact_score?: number;
    endorsements_count?: number;
    work_items_count?: number;
    tasks_count?: number;
}

// Social
export interface CommentCreate {
    content: string;
}

export interface CommentResponse {
    id: string;
    content: string;
    post_id: string;
    user_id: string;
    user_name?: string;
    user_avatar?: string;
    created_at: string;
}
