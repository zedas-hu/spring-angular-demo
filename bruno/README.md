# Bruno API tests

The collection covers every Spring backend REST route, including session
handling and the session-protected album and track writes.

Start the backend with the Chinook database available, then run the collection
in Bruno or from this directory with the Bruno CLI:

```shell
bru run --env Localdev --tests-only
```

The `Localdev` environment targets `http://localhost:4200`. Requests must run
as a collection in sequence: they sign in, create a uniquely named album and
track, update and delete the track, then delete the album and sign out. The
test database should contain the standard Chinook records used by the demo.
