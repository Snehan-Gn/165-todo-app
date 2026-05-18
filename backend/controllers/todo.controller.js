const invalidateTodoCache = async (redis, user_id) => {
  if (redis?.isOpen) {
    await redis.del(`todos:${user_id}`);
  }
};

const TodoController = {
  createTodo: async (req, res) => {
    const user_id = req.sub;
    const { text, date } = req.body;
    const { Todo } = req.app.locals.models;
    const redis = req.app.locals.redis;

    try {
      const result = await Todo.create({
        text,
        date,
        completed: false,
        user_id
      });

      await invalidateTodoCache(redis, user_id);

      return res.status(201).json(result);
    } catch (error) {
      console.error('ADD TODO: ', error);
      return res.status(500).json({ message: 'Erreur lors de la création' });
    }
  },

  getAllTodo: async (req, res) => {
    const user_id = req.sub;
    const { Todo } = req.app.locals.models;
    const redis = req.app.locals.redis;
    const cacheKey = `todos:${user_id}`;

    try {
      if (redis?.isOpen) {
        const cachedTodos = await redis.get(cacheKey);
        if (cachedTodos) {
          return res.status(200).json(JSON.parse(cachedTodos));
        }
      }

      const result = await Todo.find({ user_id }).sort({ date: 1 }).select('-user_id');

      if (result) {
        if (redis?.isOpen) {
          await redis.setEx(cacheKey, 3600, JSON.stringify(result));
        }
        return res.status(200).json(result);
      }
      return res.status(404).send();
    } catch (error) {
      console.error('GET ALL TODO: ', error);
      return res.status(500).send();
    }
  },

  editTodo: async (req, res) => {
    const user_id = req.sub;
    const { Todo } = req.app.locals.models;
    const redis = req.app.locals.redis;

    try {
      const result = await Todo.findOneAndUpdate(
        { _id: req.params.id, user_id },
        { $set: req.body },
        { returnDocument: 'after' } 
      );

      if (result) {
        await invalidateTodoCache(redis, user_id);
        return res.status(200).json(result);
      }
      return res.status(404).send();
    } catch (error) {
      console.error('UPDATE TODO: ', error);
      return res.status(500).send();
    }
  },

  deleteTodo: async (req, res) => {
    const user_id = req.sub;
    const { Todo } = req.app.locals.models;
    const redis = req.app.locals.redis;

    try {
      await Todo.deleteOne({ _id: req.params.id, user_id });
      await invalidateTodoCache(redis, user_id);
      return res.status(200).json({ id: req.params.id });
    } catch (error) {
      console.error('DELETE TODO: ', error);
      return res.status(500).send();
    }
  },

  getSearchTodo: async (req, res) => {
    const user_id = req.sub;
    const query = (req.query.q || '').trim();
    const { Todo } = req.app.locals.models;

    if (!query) {
      return res.status(400).json({ message: 'Paramètre de recherche manquant' });
    }

    try {
      const result = await Todo.find(
        {
          user_id,
          $text: { $search: query }
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' }, date: 1 })
        .select('-user_id -score');

      return res.status(200).json(result);
    } catch (error) {
      console.error('SEARCH TODO: ', error);
      return res.status(500).send();
    }
  }
};

module.exports = TodoController;
