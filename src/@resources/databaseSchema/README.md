# Database schemas

Database schemas are effectively namespaces. Or for those more familiar with the anatomy of
most database software, a "database". Yes, we also found it confusing that database instances
use the word "database" for namespacing, so we decided to call it something else.

Each database schema has its own set of tables so as to remain isolated from other schemas
despite residing on the same instance or cluster. This helps operators consolidate the effort
needed to manage database instances without causing developers creating tables to collide with
one another.
