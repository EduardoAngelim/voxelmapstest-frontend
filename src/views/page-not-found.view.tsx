import { Button, Result } from "antd"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const PageNotFound = () => {

    const navigate = useNavigate()

    useEffect(() => {
        let body = document.getElementsByTagName('body')[0]
        body.style.backgroundColor = 'white'
    }, [])

    return(
        <Result
            status="404"
            title="404"
            subTitle="Page Not Found."
            style={{color: 'white'}}
            extra={<Button type="link" onClick={() => navigate('/')}>Back to Home Page</Button>}
        />
    )
}

export default PageNotFound