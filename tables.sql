create table towns (
	town_id serial not null primary key,
    town_name text not null,
	reg_string text not null	
);
create table registrationnumbers(
	id serial not null primary key,
	registration_num text not null,
	town_id  int not null,
	foreign key (town_id) references towns (town_id)
);
insert into towns (town_name, reg_string) values ('Cape Town', 'CA');
insert into towns (town_name, reg_string) values ('Bellville ', 'CY');
insert into towns (town_name, reg_string) values ('Paarl', 'CL');

-- alter table towns add constraint uniq_desc_constraint unique(town_name);
-- database name =  registration_numbers1
