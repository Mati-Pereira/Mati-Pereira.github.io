---
title: 'Python Learnings for a Beginner'
description: 'In these first posts I want to share just what I am learning, nothing very structured for now'
date: 2026-10-31
tags: [meta, studies]
level: beginner
translationOf: 31-10-2026
---

There is a famous idea (the Feynman technique): **you only truly learned something when you can explain it in a simple way**.

## Python

1. Python has a special syntax for accessing the last element of a
list. When you ask for the item at index -1, Python always returns the last item
of the list:

```python
bicycles = ['trek', 'cannondale', 'redline', 'specialized']
print(bicycles[-1])

# Shows 'specialized'
```

2. Index -2 returns the second item from
the end of the list, index -3 returns the third item from the end, and
so on.

```python
bicycles = ['trek', 'cannondale', 'redline', 'specialized']
print(bicycles[-2])

# Shows 'redline'
```


See you in the next post!
