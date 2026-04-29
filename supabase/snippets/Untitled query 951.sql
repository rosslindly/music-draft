create table artists (                                                         
    id text primary key,                                    
    name text not null,
    image_url text,
    spotify_url text,
    updated_at timestamptz default now()
  );
