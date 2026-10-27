-- Add a third player display style for trial documents:
--   number          → "#24"
--   initial_surname → "S.Smith"
--   first_initial   → "Sally.S"   (NEW)
-- Clashes in the two name styles are separated in the app by extending the
-- abbreviated part a letter at a time (e.g. "Sally.Sm" vs "Sally.Si").

alter table trials drop constraint if exists trials_display_mode_check;

alter table trials
  add constraint trials_display_mode_check
  check (display_mode in ('number', 'initial_surname', 'first_initial'));
