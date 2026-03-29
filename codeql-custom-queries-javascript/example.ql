import javascript

from Function f
where 
  f.getName() = "eval" and
  not f.getFile().getRelativePath().matches("%/node_modules/%")
select f, "Use of eval in your code"