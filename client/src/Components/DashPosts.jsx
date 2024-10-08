import { useEffect, useState } from "react";
import {useSelector} from 'react-redux';
import { Table, Button, Spinner } from 'flowbite-react';
import {Link} from 'react-router-dom';
import { Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from "react-icons/hi";

const DashPosts = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore]  = useState(true);
  const [showModal, setShowModal] = useState(false);//it is useful when you want to delete a post then it will show a modal asking you if you want to delete the post
  const [deletePostId, setDeletePostId] = useState('');
  const [ loading, setLoading ] = useState(false);

  useEffect(()=>{
    const fetchPosts = async()=>{
      try {
        setLoading(true);
        //go through post.controller.js file in backend
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);
        const data = await res.json();

        if(!res.ok){  
          setLoading(false);
        }

        if(res.ok){
          setLoading(false);
          setUserPosts(data.posts);
          //at the backend in the posts.controller.js we have a limit of 9 posts fetching at a time
          //and when you click on the show more button, you will see the remaining posts displayed on the page
          if(data.posts.length < 9){
            setShowMore(false);
          }
        }
       // console.log(userPosts);
        
      } catch (error) {
        setLoading(false);
        console.log(error.message);
        
      }
    };

    if(currentUser.isAdmin){
       fetchPosts();
    }

  },[currentUser._id]);


  //show more posts
  const handleShowMore = async() => {
      const startIndex = userPosts.length;
      try {
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`);
        const data = await res.json();
        if(res.ok){
          setUserPosts((prev) => [...prev, ...data.posts])
          if(data.posts.length < 9){
            setShowMore(false);
          }
        }
      } catch (error) {
          console.log(error.message);
          
      }
  }


//delete post
const handleDeletePost = async() => {
   setShowModal(false);

   try {
     const res = await fetch(`/api/post/deletepost/${deletePostId}/${currentUser._id}`, {
        method: 'DELETE'
     });

     const data = await res.json();

     if(!res.ok){
        console.log(data.message);
     } else{
        setUserPosts((prev) => 
          prev.filter((post) => post._id !== deletePostId)
        );
     }

   } catch (error) {
      console.log(error);
   }
}


if(loading) return(
  <div className="w-full flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
  </div>
)

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3
     scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700
     dark:scrollbar-thumb-slate-500
     ">
      { currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            {userPosts.map((post) => (
              <Table.Body className="divide-y" key={post._id}>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{new Date(post.updatedAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Link to={`/post/${post.slug}`}>
                       <img
                        src={post.image}
                        alt={post.title}
                        className="w-20 h-10 object-cover bg-gray-500"
                       />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                      <Link className="font-medium text-gray-900 dark:text-white" to={`/post/${post.slug}`}>
                        {post.title}
                      </Link>
                  </Table.Cell>
                  <Table.Cell>{post.category}</Table.Cell>
                  <Table.Cell>
                    <span 
                    className="font-medium text-red-600 hover:underline cursor-pointer"
                    onClick={() => {
                      setShowModal(true)
                      setDeletePostId(post._id);
                    }}
                    >Delete</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline" to={`/update-post/${post._id}`}>
                      <span>Edit</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>

          {showMore && (
            <button 
            onClick={handleShowMore}
            className="w-full hover:underline text-teal-500 self-center text-sm py-7">Show more</button>
          )}
        </>
      ): 
      (
        <p>You have not posts</p>
      )
    }
     <Modal show={showModal}
       onClose={ () => setShowModal(false)}
       popup
       size='md'
       >
        <Modal.Header/>
        <Modal.Body>
            <div className="text-center">
               <HiOutlineExclamationCircle 
               className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto'/>
               <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to delete this post?    
               </h3>
               <div className='flex justify-center gap-4'>
                <Button color='failure' onClick={handleDeletePost}>Yes, I'm sure</Button>
                <Button color='gray' onClick={() => setShowModal(false)}>No, cancel</Button>
               </div>
            </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default DashPosts