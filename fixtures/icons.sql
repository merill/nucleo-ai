create table groups (
  id integer primary key autoincrement,
  title varchar(255),
  sizes varchar(255),
  remote_id integer,
  local integer,
  "order" integer,
  demo boolean,
  created_at datetime default current_timestamp,
  updated_at datetime,
  group_id integer,
  icons_count integer,
  fav_count integer
);

create table sets (
  id integer primary key autoincrement,
  local boolean,
  demo boolean,
  group_id integer,
  remote_id integer,
  "order" integer,
  fav_count integer,
  title varchar(255),
  sizes varchar(255),
  created_at datetime default current_timestamp,
  updated_at datetime,
  icons_count integer,
  set_type integer
);

create table icons (
  id integer primary key autoincrement,
  local boolean,
  remote_id integer,
  uuid integer,
  klass varchar(255),
  grid integer,
  width integer,
  height integer,
  size integer,
  fill_all boolean,
  tags varchar(255),
  nucleo_tags varchar(255),
  set_id integer,
  project_id integer,
  filename varchar(255),
  name varchar(255),
  src varchar(255),
  favourite boolean,
  demo boolean default 0,
  originalColor varchar(255),
  stroke_max integer,
  corner_custom integer default 0,
  place integer,
  created_at datetime default current_timestamp,
  updated_at datetime
);

insert into groups (id, title, sizes, remote_id, local, icons_count, fav_count)
values
  (1, 'Nucleo UI', '12,18', 2, 2, 2, 0),
  (2, 'Nucleo Core', '24,32,48', 3, 2, 1, 0);

insert into sets (id, local, demo, group_id, remote_id, title, sizes, icons_count)
values
  (101, 1, 0, 1, 1001, 'Settings', '18', 2),
  (201, 1, 0, 2, 2001, 'Charts', '24', 1),
  (301, 1, 0, null, null, 'Nucleo Credit Cards', '32', 1),
  (401, 1, 0, null, null, 'Nucleo UI Essential', '18', 1);

insert into icons (id, local, klass, grid, width, height, size, tags, nucleo_tags, set_id, filename, name, favourite, demo, corner_custom)
values
  (1, 1, 'outline', 18, 18, 18, 18, 'settings,gear,preferences', 'settings,control', 101, 'settings', 'settings', 0, 0, 0),
  (2, 1, 'outline', 18, 18, 18, 18, 'sliders,control,filters', 'settings,filters', 101, 'sliders', 'sliders', 0, 0, 0),
  (3, 1, 'glyph', 24, 24, 24, 24, 'chart,data,analytics', 'chart,bar,data', 201, 'chart-bar', 'chart bar', 0, 0, 0),
  (4, 1, 'colored', 32, 32, 32, 32, 'card,billing,payment', 'credit,card', 301, 'visa', 'visa', 0, 0, 0),
  (5, 1, 'glyph-duo', 18, 18, 18, 18, 'timer,clock,time', 'timer,clock', 401, 'timer-2', 'timer 2', 0, 0, 0);
