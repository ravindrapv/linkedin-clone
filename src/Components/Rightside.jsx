import styled from "styled-components";

/*________________________________________________________________________________*/

const Rightside = (props) => {
  return (
    <Container>
      <FollowCard className="bg-white p-4 rounded-lg shadow-lg">
        <Title>
          <h2>LinkedIn News</h2>
          <img src="/Images/feed-icon.svg" alt="" />
        </Title>

        <div className="mb-8 mt-8">
          <div className=" text-sm  mb-2">IT hiring more talent at the top</div>
          <div className="text-gray-500">19h ago • 730 readers</div>
        </div>
      </FollowCard>
      <BannerCard>
        <img src="/Images/ads.png" alt="" />
      </BannerCard>
    </Container>
  );
};
export default Rightside;

/*________________________________________________________________________________*/

const Container = styled.div`
  grid-area: rightside;
`;
/*_________________________________________*/
const FollowCard = styled.div`
  text-align: center;
  overflow: hidden;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 5px;
  position: relative;
  border: none;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%);
  padding: 12px;
`;
/*_________________________________________*/
const Title = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16.5px;
  width: 100%;
  h2 {
    color: #333;
    font-weight: 700;
  }
`;

/*_________________________________________*/
const BannerCard = styled(FollowCard)`
  position: sticky;
  top: 75px;
  img {
    width: 100%;
    height: 100%;
  }
`;
/*________________________________________________________________________________*/
