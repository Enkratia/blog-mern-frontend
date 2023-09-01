import React from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';

import { useSelector } from "react-redux";
import { selectIsAuth } from "../../redux/slices/auth";
import { useNavigate, Navigate, useParams } from "react-router-dom"
import axios from "../../axios";

export const AddPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const isAuth = useSelector(selectIsAuth);
  const inputFileRef = React.useRef(null);

  const [ isLoading, setIsLoading ] = React.useState(false);
  
  const [text, setText] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState();

  const onSubmit = async (e) => {
    try {
      setIsLoading(true);
      
      const fields = {
        title,
        text,
        tags,
        imageUrl,
      }

      const { data } = isEditing ? await axios.patch(`/posts${id}`, fields) : await axios.post("/posts", fields);

      const _id = isEditing ? id : data._id;
      navigate(`/posts/${_id}`)
    } catch (err) {
      console.warn(err)
    }
  }

  const handleChangeFile = async (e) => {
    try {
      const formData = new FormData();
      const file = e.target.files[0]
      formData.append("image", file);

      const {data} = await axios.post("/upload", formData);
      console.log(data)
      setImageUrl(data.url);
    } catch (err) {
      console.warn("Ошибка");
    }
  };

  const onClickRemoveImage =  () => {
    setImageUrl(undefined);
  };

  const onChange = React.useCallback((text) => {
    setText(text);
  }, []);

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '400px',
      autofocus: true,
      placeholder: 'Введите текст...',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    [],
  );

  React.useEffect(() => {
    if (id) {
      axios.get(`posts/${id}`).then(({data}) => {
        setText(data.text);
        setTitle(data.title);
        setImageUrl(data.imageUrl);
        setTags(data.tags);
      })
    }
  }, [])

  if (!window.localStorage.getItem("token") && !isAuth) {
    return <Navigate to="/" />
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
        Загрузить превью
      </Button>
      <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden />
      {imageUrl && (
        <>
         <Button variant="contained" color="error" onClick={onClickRemoveImage}>
           Удалить
         </Button>
         <img className={styles.image} src={`http://localhost:4444/${imageUrl}`} alt="Uploaded" />
        </>
      )}
      <br />
      <br />
      <TextField
        value={title}
        onChange={e => setTitle(e.target.value)}
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        fullWidth
      />
      <TextField value={tags} onChange={e => setTags(e.target.value)} classes={{ root: styles.tags }} 
      variant="standard" placeholder="Тэги" fullWidth />

      <SimpleMDE className={styles.editor} value={text} onChange={setText} options={options} />

      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEditing ? "Сохранить" : `Опубликовать`}
        </Button>
        <a href="/">
          <Button size="large">Отмена</Button>
        </a>
      </div>
    </Paper>
  );
};
