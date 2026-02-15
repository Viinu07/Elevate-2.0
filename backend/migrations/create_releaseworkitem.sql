CREATE TABLE IF NOT EXISTS releaseworkitem (
    id BIGINT PRIMARY KEY,
    title VARCHAR,
    team_name VARCHAR,
    release_version VARCHAR,
    unit_testing_checked BOOLEAN DEFAULT FALSE,
    unit_testing_date VARCHAR,
    system_testing_checked BOOLEAN DEFAULT FALSE,
    system_testing_date VARCHAR,
    int_testing_checked BOOLEAN DEFAULT FALSE,
    int_testing_date VARCHAR,
    pvs_testing BOOLEAN DEFAULT FALSE,
    pvs_intake_number VARCHAR,
    warranty_call_needed BOOLEAN DEFAULT FALSE,
    confluence_updated BOOLEAN DEFAULT FALSE,
    csca_intake VARCHAR DEFAULT 'No'
);

CREATE INDEX IF NOT EXISTS ix_releaseworkitem_id ON releaseworkitem (id);
CREATE INDEX IF NOT EXISTS ix_releaseworkitem_title ON releaseworkitem (title);
CREATE INDEX IF NOT EXISTS ix_releaseworkitem_team_name ON releaseworkitem (team_name);
CREATE INDEX IF NOT EXISTS ix_releaseworkitem_release_version ON releaseworkitem (release_version);
